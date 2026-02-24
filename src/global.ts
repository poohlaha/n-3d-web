/**
 * @fileOverview 全局 Jet、Context 类
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import { Jet } from '@bale-web/jet/export'

let jetInstance: Jet | null = null
let contextInstance: Map<string, unknown> = new Map()

export function setJet(jet: any) {
  jetInstance = jet
}

export function getJet() {
  return jetInstance
}

export function setContext(context: Map<string, unknown> = new Map()) {
  contextInstance = context
}

export function getContext() {
  return contextInstance
}
