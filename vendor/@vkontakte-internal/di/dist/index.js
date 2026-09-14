// tsyringe требует полифил Reflect до первого использования декораторов
import 'reflect-metadata'

export * from './container.js'
export * from './entitiesDecorators.js'
export * from './scope.js'
export * from './symbols.js'
export { createWidget } from './providers/widget.js'
export { createProvider } from './providers/model.js'
export { Props } from './providers/props.js'
export { DIProvider, useContainer } from './providers/container.js'
export const Constructor = undefined
