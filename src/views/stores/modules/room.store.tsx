/**
 * @fileOverview room store
 * @date 2023-07-05
 * @author poohlaha
 */
import BaseStore from '../base/base.store'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { action, observable } from 'mobx'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js'
import { invoke } from '@tauri-apps/api/core'
import Utils from '@utils/utils'
import { TOAST } from '@utils/base'

class RoomStore extends BaseStore {
  @observable scene: THREE.Scene | null = null
  @observable camera: THREE.PerspectiveCamera | null = null
  @observable controls: OrbitControls | null = null
  @observable renderer: THREE.WebGLRenderer | null = null
  @observable plane: THREE.Mesh | null = null
  @observable groundPlane: THREE.Plane | null = null
  @observable mouse: THREE.Vector2 | null = null
  @observable raycaster: THREE.Raycaster | null = null
  @observable selectedCube: THREE.Mesh | null = null
  @observable person: THREE.Mesh | null = null // 小人
  @observable personPosition: { x: number; z: number } | null = null // 小人坐标

  // 人物
  @observable mixers: Array<any> = []
  @observable clock: THREE.Clock | null = null
  @observable character: THREE.Object3D | null = null
  @observable mixer: THREE.AnimationMixer | null = null
  @observable mixerActions: { [K: string]: any } = {}
  @observable currentAction: THREE.AnimationAction | null = null

  // 地砖
  @observable textureLoader: THREE.TextureLoader | null = null

  // 移动
  @observable targetPosition = new THREE.Vector3()
  @observable isMoving = false
  @observable isUpdating = false
  @observable accumulator: number = 0
  readonly FIXED = 1 / 60

  readonly WIDTH = 200
  readonly HEIGHT = 200
  readonly WALL_THICKNESS = 0.5 // 墙厚

  // 机器人占用格子数
  @observable character_occupy_width: number = 2
  @observable character_occupy_height: number = 2

  readonly ACTIONS: Array<{ [K: string]: any }> = [
    {
      label: '待机',
      value: 'idle'
    },
    {
      label: '走',
      value: 'walking'
    },
    {
      label: '跑',
      value: 'running'
    },
    {
      label: '跳舞',
      value: 'dance'
    },
    {
      label: '死亡',
      value: 'death'
    },
    {
      label: '坐下',
      value: 'sitting'
    },
    {
      label: '站立',
      value: 'standing'
    }
  ]

  @observable action: string = this.ACTIONS[0].value || ''
  readonly ONCE_ACTIONS = ['death', 'sitting', 'standing']

  readonly EMOTES: Array<{ [K: string]: any }> = [
    {
      label: '跳',
      value: 'jump'
    },
    {
      label: '点头',
      value: 'yes'
    },
    {
      label: '摇头',
      value: 'no'
    },
    {
      label: '挥手',
      value: 'wave'
    },
    {
      label: '出拳',
      value: 'punch'
    },
    {
      label: '点赞',
      value: 'thumbsup'
    }
  ]

  @observable emote: string = ''

  /**
   * 初始化
   */
  @action
  async init(container: HTMLElement) {
    // ===============================
    // 创建场景 Scene
    // ===============================

    // 创建场景 Scene
    // Scene 是 3D 世界的容器
    // 所有物体、光源、相机都放在里面
    this.scene = new THREE.Scene()

    // 设置背景颜色
    this.scene.background = new THREE.Color(0x202020)

    // ===============================
    // 创建相机 Camera
    // ===============================
    this.camera = new THREE.PerspectiveCamera(
      75, // 视角
      container.clientWidth / container.clientHeight, // 宽高比
      0.1, // 最近能看到 0.1
      1000 // 最远能看到 1000
    )

    // 把相机往后拉一点，否则看不到东西
    this.camera.position.set(0, 5, 10)

    // 让相机看向原点
    this.camera.lookAt(0, 0, 0)

    // ===============================
    // Raycaster 用于检测点击
    // 从相机发出一条射线，穿过鼠标位置，打到场景物体上
    // 返回点击的世界坐标: { point: Vector3 }
    // ===============================
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    // ===============================
    // 3创建渲染器 Renderer
    // ===============================
    this.renderer = new THREE.WebGLRenderer({
      antialias: true // 抗锯齿
    })

    // 设置渲染尺寸
    this.renderer.setSize(container.clientWidth, container.clientHeight)

    // 设置色彩
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1

    // 把 canvas 插入到页面
    container.appendChild(this.renderer?.domElement)

    // ===============================
    // 添加鼠标轨道控制器
    // ===============================
    this.controls = new OrbitControls(this.camera, this.renderer?.domElement)

    //  让控制器有阻尼效果（更平滑）
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05

    // 启用缩放（默认开启）
    this.controls.enableZoom = true

    // 启用平移
    this.controls.enablePan = true

    // 可选：设置平移速度
    this.controls.panSpeed = 1.0

    // 可选：锁定旋转只看平面
    this.controls.maxPolarAngle = Math.PI / 2 // 不让摄像机翻到平面下方
    this.controls.minPolarAngle = 0

    // 限制最近编放
    this.controls.minDistance = 5

    // ===============================
    // 添加光源 Light
    // ===============================

    // 环境光（整体亮一点）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    // 方向光（像太阳）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 10, 5)
    this.scene.add(directionalLight)

    // ===============================
    // 创建一个平面（地面）
    // ===============================

    // PlaneGeometry(宽, 高)
    // 几何体是以原点 (0,0,0) 为中心创建的
    // 如果宽是 20: 左边 = -10, 右边 = +10, 因为: 中心 0, 向左 10, 向右 10, 总共 20
    // const planeGeometry = new THREE.PlaneGeometry(this.WIDTH, this.HEIGHT, 200, 200)
    const planeGeometry = new THREE.PlaneGeometry(this.WIDTH, this.HEIGHT)

    // 材质（可受光照影响）
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      side: THREE.DoubleSide
    })

    // const planeMaterial = this.onLayingFloor()

    // 创建网格（几何体 + 材质）
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial)
    this.groundPlane = new THREE.Plane(
      new THREE.Vector3(0, 1, 0), // y 轴向上
      0 // y = 0
    )

    // 旋转平面，让它变成“地面”
    // 默认是竖着的，需要躺下
    // X → 左右, Y → 上下, Z → 前后, 旋转后: X → 左右, Z → 前后, Y → 高度
    // 所以实际地面: x - -10 到 +10, z - -10 到 +10, y: 0(地面高度)
    this.plane.rotation.x = -Math.PI / 2

    // 加入场景
    this.scene.add(this.plane)

    // 平移, 保持以 0 为中心, 这样: x: 0 - 20, z: 0 - 20
    /*
                 Z+
                 |
                 |
      X- ------- 0 ------- X+
                 |
                 |
                 Z-
      中心是 (0,0)
     */
    // plane.position.set(40, 0, 40)

    // ===============================
    // 添加网格辅助线
    // ===============================

    // GridHelper(大小, 分段数)
    // 上面使用 planeGeometry 创建一个 宽 20，高 20 的平面
    // x 从 -10 到 10
    // z 从 -10 到 10
    // 每 1 个单位是一个格子
    // 一个 20x20 的网格
    const gridHelper = new THREE.GridHelper(
      this.WIDTH, // 整个网格大小（要和地面一样大）
      this.WIDTH // 分成多少格（80格 → 1格 = 1单位）
      // 0xff0000, // 中心线颜色 → 红色 0xff0000
      // 0x808080 // 其他网格线颜色 → 灰色
    )

    gridHelper.position.y = 0.01 // 微微抬高格子, 防止旋转平台时抖动

    this.scene.add(gridHelper)

    // 红色 = X, 绿色 = Y, 蓝色 = Z
    // this.scene.add(new THREE.AxesHelper(5))

    // 加载背景
    this.onSetBackground()

    // 设置外墙
    this.onSetOuterWall()

    // 加载人物
    this.onLoadPerson()

    await this.animate()
  }

  /**
   * 加载人物
   */
  @action
  onLoadPerson() {
    this.clock = new THREE.Clock()
    const loader = new GLTFLoader()
    loader.load(
      'models/RobotExpressive.glb',
      gltf => {
        const model = gltf.scene
        model.scale.set(1, 1, 1)
        model.position.set(0, 0, 0) // 放在格子中央
        this.scene?.add(model)

        this.character = model

        // 播放所有动画
        this.mixer = new THREE.AnimationMixer(model)
        gltf.animations.forEach(clip => {
          this.mixerActions[clip.name.toLowerCase()] = this.mixer?.clipAction(clip)
          if (clip.name.toLowerCase() === this.ACTIONS[0].value) {
            this.mixer?.clipAction(clip).play()
          }
        })

        this.mixers.push(this.mixer)
      },
      undefined,
      err => this.logger()?.error(`加载人物失败: ${err}`)
    )
  }

  /**
   * 铺设地砖
   */
  @action
  onLayingFloor() {
    this.textureLoader = new THREE.TextureLoader()
    const exrLoader = new EXRLoader()

    // 颜色贴图
    const colorMap = this.textureLoader.load('floor/granite/textures/granite_tile_diff_1k.jpg')

    // 法线贴图
    const normalMap = exrLoader.load('floor/granite/textures/granite_tile_nor_gl_1k.exr')

    // 粗糙度贴图
    const roughnessMap = exrLoader.load('floor/granite/textures/granite_tile_rough_1k.exr')

    // 设置重复
    // eslint-disable-next-line no-multi-assign
    colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping
    // eslint-disable-next-line no-multi-assign
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping
    // eslint-disable-next-line no-multi-assign
    roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping

    // 4个格子一块地砖
    const repeatCount = this.WIDTH / 4
    colorMap.repeat.set(repeatCount, repeatCount)
    normalMap.repeat.set(repeatCount, repeatCount)
    roughnessMap.repeat.set(repeatCount, repeatCount)

    colorMap.colorSpace = THREE.SRGBColorSpace

    const material = new THREE.MeshStandardMaterial({
      map: colorMap,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      roughness: 1
    })

    material.displacementMap = this.textureLoader.load('floor/granite/textures/granite_tile_disp_1k.png')
    material.displacementScale = 0.05
    return material
  }

  /**
   * 设置背景
   */
  @action
  onSetBackground() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer!)
    pmremGenerator.compileEquirectangularShader()

    new HDRLoader().load('hdris/charolettenbrunn_park.hdr', texture => {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture

      this.scene!.environment = envMap
      this.scene!.background = envMap
      texture.dispose()
      pmremGenerator.dispose()
    })
  }

  /**
   * 设置外围墙面
   *            Z+
   *             |
   *             |
   *  X- ------- 0 ------- X+
   *             |
   *             |
   *             Z-
   */
  @action
  onSetOuterWall() {
    const wallHeight = 3 // 墙高

    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 })

    // vertical: 表示墙是否是垂直方向（沿 Z 轴）
    // true: X 方向：厚度 (wallThickness), Y 方向：高度 (wallHeight), Z 方向：长度 (length)
    // false: X 方向：长度 (length), Y 方向：高度 (wallHeight), Z 方向：厚度 (wallThickness)
    const onAddWall = (x: number, z: number, length: number, vertical: boolean) => {
      const geometry = vertical
        ? new THREE.BoxGeometry(this.WALL_THICKNESS, wallHeight, length)
        : new THREE.BoxGeometry(length, wallHeight, this.WALL_THICKNESS)

      const wall = new THREE.Mesh(geometry, wallMaterial)
      wall.position.set(x, wallHeight / 2, z)
      this.scene!.add(wall)
    }

    // 1. 上边墙(沿 X 方向), 长 80, 厚 wallThickness, 位置: z = -40 + wallThickness / 2
    onAddWall(0, -100 + this.WALL_THICKNESS / 2, 200, false)

    // 2. 下边墙(沿 X 方向), 长 80, 厚 wallThickness, 位置: z = 40 - wallThickness / 2
    onAddWall(0, 100 - this.WALL_THICKNESS / 2, 200, false)

    // 3. 左边墙(沿 Z 方向), 长 80, 厚 wallThickness, 位置: z = -40 + wallThickness / 2
    onAddWall(-100 + this.WALL_THICKNESS / 2, 0, 200, true)

    // 4. 右边墙(沿 Z 方向), 长 80, 厚 wallThickness, 位置: z = 40 - wallThickness / 2
    onAddWall(100 - this.WALL_THICKNESS / 2, 0, 200, true)
  }

  /**
   * 更新机器人位置
   */
  @action
  async onUpdateRobotPosition(delta: number) {
    if (!this.isMoving) return
    if (this.isUpdating) return // 防止并发
    if (this.action !== this.ACTIONS[1].value && this.action !== this.ACTIONS[2].value) return

    this.isUpdating = true
    const state: { [K: string]: any } = await invoke('on_update_robot_position', { delta })
    this.logger()?.info(`state: ${JSON.stringify(state || {})}`)
    this.character!.position.set(state.position.x, state.position.y || 0, state.position.z)
    this.character!.rotation.y = state.rotationY

    this.isMoving = state.isMoving
    this.isUpdating = false

    // 恢复 idle 状态
    if (!this.isMoving) {
      this.action = this.ACTIONS[0].value
      const idleAction = this.mixerActions[this.ACTIONS[0].value]
      idleAction
        .reset()
        .setEffectiveWeight(1)
        .play()
      this.currentAction?.crossFadeTo(idleAction, 0.2, true)
      this.currentAction = idleAction
    }

  }

  /**
   * 渲染循环
   */
  @action
  async animate() {
    requestAnimationFrame(this.animate.bind(this))
    // 每一帧重新渲染
    const delta = this.clock?.getDelta()
    if (delta) {
      this.mixers.forEach(mixer => mixer.update(delta))
    }

    this.controls?.update()

    this.accumulator += delta || 0
    if (this.accumulator >= this.FIXED) {
      this.accumulator -= this.FIXED

      // 人物移动
      await this.onUpdateRobotPosition(this.FIXED)
    }

    /*
    if (this.isMoving) {
      const direction = new THREE.Vector3()
      // direction = a - b, 方向 = 目标位置 - 当前角色位置
      direction.subVectors(this.targetPosition, this.character!.position)

      // 计算向量长度, 公式: √(x² + y² + z²)
      const distance = direction.length()

      const speed = 0.3
      if (distance > 0.1) {
        direction.y = 0 // 忽略垂直方向

        // 向量变成单位向量(长度变成 1), 公式: (x, y, z) / length
        direction.normalize()

        const targetQuaternion = new THREE.Quaternion()
        targetQuaternion.setFromUnitVectors(
          new THREE.Vector3(0, 0, 1), // 默认人物朝向 Z+
          direction
        )

        this.character!.quaternion.slerp(targetQuaternion, 0.1) // 0.1 控制旋转速度

        this.character!.position.add(
          direction.multiplyScalar(speed) // direction = direction * 0.05, 每一帧移动 0.05 个单位
        )
      } else {
        this.character!.position.copy(this.targetPosition)
        this.isMoving = false
      }
    }
     */

    this.renderer?.render(this.scene!, this.camera!)
  }

  @action
  onMoveCharacterToPoint(point: THREE.Vector3) {
    this.targetPosition.copy(point)
    this.isMoving = true
  }

  /**
   * 设置动作
   * @param value
   */
  @action
  async onSetAction(value: string = '') {
    try {
      let action = this.ACTIONS.find((item: { [K: string]: any } = {}) => item.value === value) || {}
      if (Utils.isObjectNull(action || {})) {
        value = this.ACTIONS[0].value
      }

      this.action = value
      this.logger()?.info(`执行动作: ${value}`)

      await invoke('set_robot_action', { action: value })
      const mixerAction = this.mixerActions[value]
      if (!mixerAction) return

      if (this.currentAction === mixerAction) return
      if (this.action === this.ACTIONS[1].value) {
        mixerAction.setEffectiveTimeScale(1.0) // walk
      } else if (this.action === this.ACTIONS[2].value) {
        mixerAction.setEffectiveTimeScale(1.5) // run
      }

      const isOnce = this.ONCE_ACTIONS.includes(value)
      // 配置循环模式
      mixerAction.reset()
      if (isOnce) {
        mixerAction.setLoop(THREE.LoopOnce, 1)
        mixerAction.clampWhenFinished = true
      } else {
        mixerAction.setLoop(THREE.LoopRepeat, Infinity)
        mixerAction.clampWhenFinished = false
      }

      mixerAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play()

      if (this.currentAction) {
        this.currentAction.crossFadeTo(mixerAction, 0.2, true)
      }

      this.currentAction = mixerAction
    } catch (e) {
      TOAST.show({ message: '设置动作失败', type: 4 })
      this.logger()?.error(`设置动作失败: ${e}`)
    }
  }

  /**
   * 设置表情
   * @param value
   */
  @action
  async onSetEmote(value: string = '') {
    if (this.action === this.ACTIONS[1].value || this.action === this.ACTIONS[2].value) return
    try {
      let emote = this.EMOTES.find((item: { [K: string]: any } = {}) => item.value === value) || {}
      if (Utils.isObjectNull(emote || {})) {
        value = this.EMOTES[0].value
      }

      this.emote = value
      this.logger()?.info(`执行表情: ${value}`)

      // await invoke('set_robot_emote', { emote: value })
      const mixerAction = this.mixerActions[value]
      if (!mixerAction) return

      const previousAction = this.currentAction
      const idleAction = this.mixerActions[this.ACTIONS[0].value]
      // 切回 idle
      if (previousAction !== idleAction) {
        idleAction
          .reset()
          .setEffectiveWeight(1)
          .play()
        previousAction?.crossFadeTo(idleAction, 0.2, true)
        this.currentAction = idleAction
      }

      // 播放 emote
      mixerAction
        .reset()
        .setLoop(THREE.LoopOnce, 1)

      mixerAction.clampWhenFinished = true
      mixerAction.play()

      const onFinished = (e: any) => {
        if (e.action !== mixerAction) return

        // 清理 emote
        mixerAction.stop()
        mixerAction.setEffectiveWeight(0)

        if (!previousAction) return

        // 恢复之前动作
        previousAction
          .reset()
          .setEffectiveWeight(1)
          .play()

        idleAction.crossFadeTo(previousAction, 0.2, true)

        this.currentAction = previousAction
        this.mixer?.removeEventListener('finished', onFinished)
      }

      this.mixer?.addEventListener('finished', onFinished)
      this.emote = ''
    } catch (e) {
      TOAST.show({ message: '设置表情失败', type: 4 })
      this.logger()?.error(`设置表情失败: ${e}`)
    }
  }
}

export default new RoomStore()
