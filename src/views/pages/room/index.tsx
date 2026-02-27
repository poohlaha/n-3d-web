/**
 * @fileOverview room
 * @date 2023-07-05
 * @author poohlaha
 */
import React, { ReactElement, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@stores/index'
import Loading from '@views/components/loading/loading'
import Page from '@views/modules/page'
import RouterUrls from '@route/router.url.toml'
import useMount from '@hooks/useMount'
import * as THREE from 'three'
import { invoke } from '@tauri-apps/api/core'
import { Collapse, Select } from 'antd'
import { TOAST } from '@utils/base'

const Room = (): ReactElement => {
  const { roomStore } = useStore()

  const boxRef = useRef(null)

  useMount(async () => {
    if (boxRef) {
      await roomStore.init(boxRef.current)
      await roomStore.onGeneratePillars()
      // await roomStore.onGenerateStones()
      onEvent()
    }
  })

  const onEvent = () => {
    // 处理窗口缩放
    window.addEventListener('resize', () => {
      if (roomStore.camera) {
        roomStore.camera.aspect = window.innerWidth / window.innerHeight
        roomStore.camera.updateProjectionMatrix()
      }

      if (roomStore.renderer) {
        roomStore.renderer.setSize(window.innerWidth, window.innerHeight)
      }
    })

    // 鼠标点击事件
    /*
       在 GPU 渲染流程中:
       1. 世界坐标（World Space）
       2. 相机空间（View Space）
       3. 投影空间（Clip Space）
       4. 归一化设备坐标（NDC）

       在 投影计算完成后，所有可见区域都会被压缩到:
       X: -1 到 +1
       Y: -1 到 +1
       Z: -1 到 +1

       即:
       屏幕左边 = -1
       屏幕右边 = +1
       屏幕下边 = -1
       屏幕上边 = +1
       中心 = (0, 0)

       为什么浏览器坐标不一样？
       浏览器的坐标系统是:
       左上角 = (0, 0)
       X 向右增大
       Y 向下增大

       Three.js 需要的是:
       中心 = (0, 0)
       X 向右增大
       Y 向上增大

       x:
       event.clientX / window.innerWidth → 0 到 1
       * 2 → 0 0 到 2
       - 1 → -1 到  +1

       为什么 mouse.y 必须取负号?
       浏览器:
       顶部 = 0
       底部 = window.innerHeight

       Three.js NDC:
       顶部 = +1
       底部 = -1

       方向完全反的, 必须翻转
     */
    roomStore.renderer.domElement.addEventListener('click', async (event: any) => {
      if (!roomStore.raycaster || !roomStore.camera || !roomStore.mouse) return

      // 把鼠标屏幕坐标转换成 Three.js 坐标系
      // 范围必须是 -1 到 +1
      // 浏览器坐标系: 左上角是 (0,0)

      // 计算鼠标 NDC 坐标
      const rect = roomStore.renderer!.domElement.getBoundingClientRect()
      console.log('rect:', rect)
      // roomStore.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      // roomStore.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      roomStore.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      roomStore.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // 用相机和鼠标位置创建射线
      roomStore.raycaster.setFromCamera(roomStore.mouse!, roomStore.camera!)

      // 检测射线和场景物体的交点
      // const intersects = roomStore.raycaster!.intersectObject(roomStore.plane!) || []

      // 计算数学平面交点
      const intersectionPoint = new THREE.Vector3()
      const hit = roomStore.raycaster!.ray.intersectPlane(roomStore.groundPlane, intersectionPoint)

      if (hit) {
        const flag = await roomStore.onPlaceFlag(intersectionPoint)
        if (!flag) {
          roomStore.logger()?.warn('当前位置已有障碍物 ...')
          TOAST.show({ message: '当前位置已有障碍物', type: 4 })
          return
        }

        // 切换为 walking 动作
        if (roomStore.action !== roomStore.ACTIONS[1].value && roomStore.action !== roomStore.ACTIONS[2].value) {
          await roomStore.onSetAction(roomStore.ACTIONS[1].value)
        }

        console.log('intersectionPoint', intersectionPoint)
        // 限制在边界范围内
        const res: { [K: string]: number } = await invoke('world_to_grid', {
          grid: {
            x: intersectionPoint.x,
            z: intersectionPoint.z
          }
        })

        console.log('world_to_grid: ', res)

        // 直接获取 world 坐标更新人物
        const worldRes: { [K: string]: number } = await invoke('grid_to_world', {
          grid: {
            gx: res.x,
            gz: res.z
          }
        })

        // 清除旧路径
        await roomStore.onClearPath()

        // 更新目标格子
        const points: Array<{ [K: string]: number }> = await invoke('set_robot_target', {
          x: worldRes.x,
          z: worldRes.z
        })
        console.log('points:', points)
        roomStore.onDrawPath(points || [])

        console.log('grid_to_world:', worldRes)
        // roomStore.onMoveCharacterToPoint(new THREE.Vector3(worldRes.x, 0, worldRes.z))
        roomStore.isMoving = true

        /*
        const halfWidth = roomStore.width / 2
        const halfHeight = roomStore.height / 2

        const characterRadius = 2 + roomStore.WALL_THICKNESS / 2

        intersectionPoint.x = THREE.MathUtils.clamp(
          intersectionPoint.x,
          -halfWidth + characterRadius,
          halfWidth - characterRadius
        )

        intersectionPoint.z = THREE.MathUtils.clamp(
          intersectionPoint.z,
          -halfHeight + characterRadius,
          halfHeight - characterRadius
        )

        console.log('点击位置:', intersectionPoint)
        roomStore.onMoveCharacterToPoint(intersectionPoint)
         */

        // plane 范围 X: -40 → +40
        // plane 范围 Z: -40 → +40
        // gridX = Math.floor(x + 40)
        // gridZ = Math.floor(z + 40)

        /*
        // 计算格子坐标
        const gridX = Math.floor(point.x + 40)
        const gridZ = Math.floor(point.z + 40)

        // 检查小人是否已经在这个格子
        if (roomStore.personPosition && roomStore.personPosition.x === gridX && roomStore.personPosition.z === gridZ) {
          // 已经在格子里，不移动
          return
        }

        // 如果小人还没有 Mesh → 创建
        if (!roomStore.person) {
          const geometry = new THREE.BoxGeometry(1, 1, 1)
          const material = new THREE.MeshStandardMaterial({ color: 0xff0000 })
          roomStore.person = new THREE.Mesh(geometry, material)
          roomStore.scene?.add(roomStore.person)
        }

        // 更新小人位置（格子中心对齐）
        roomStore.person.position.set(gridX - 39.5 + 0.5, 0.5, gridZ - 39.5 + 0.5)

        // 更新逻辑格子
        roomStore.personPosition = { x: gridX, z: gridZ }
         */
      }
    })
  }

  const getCollapseEmoteHtml = () => {
    return (
      <div className="flex-direction-column">
        <div className="flex-direction-column">
          {(roomStore.EMOTES || []).map((item: { [K: string]: any }) => {
            return (
              <div
                key={item.value || ''}
                className="pl-2 pr-2 h-10 flex-align-center hover:bg-blue-300 cursor-pointer w-100 hover:rounded-md hover:text-white"
                onClick={async () => {
                  await roomStore.onSetEmote(item.value || '')
                }}
              >
                <p>{item.label || ''}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const getCollapseActionHtml = () => {
    return (
      <div className="flex-direction-column">
        <div className="flex-align-center">
          <Select
            className="flex-1"
            placeholder="请选择"
            value={roomStore.action}
            options={roomStore.ACTIONS}
            onChange={async (emote: string) => {
              await roomStore.onSetAction(emote)
            }}
          ></Select>
        </div>
      </div>
    )
  }

  const render = () => {
    return (
      <Page
        className="room-page relative"
        title={{
          label: RouterUrls.ROOM.NAME || ''
        }}
      >
        <div className="flex flex-1 overflow" ref={boxRef}></div>
        <Collapse
          className="absolute right-6 top-16 z-10 bg-white w-64 shadow !rounded-none"
          ghost
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: '控制面板',
              children: (
                <Collapse
                  defaultActiveKey={['11', '12']}
                  items={[
                    {
                      key: '11',
                      label: '动作',
                      children: getCollapseActionHtml()
                    },
                    {
                      key: '12',
                      label: '表情',
                      children: getCollapseEmoteHtml()
                    }
                  ]}
                ></Collapse>
              )
            }
          ]}
        />
        <Loading show={roomStore.loading} />
      </Page>
    )
  }

  return render()
}

export default observer(Room)
