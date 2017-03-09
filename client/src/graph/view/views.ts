import {h} from "snabbdom"
import {VNode} from "snabbdom/vnode"
import {View, RenderingContext} from "../../base/view"
import {Point} from "../../utils"
import {GGraph, GNode, GEdge, GGraphElement} from "../model"

/**
 * View component that turns a GGraph element and its children into a tree of virtual DOM.
 */
export class GGraphView implements View {

    render(model: GGraph, context: RenderingContext): VNode {
        const virtualShapes = model.children.map((shape) => this.renderShape(shape, context))
        const vNode = h('svg', {
            key: model.id,
            attrs: {
                id: model.id
            }
        }, [
            h('g', {}, virtualShapes)]
        );
        return vNode
    }

    renderShape(shape: GGraphElement, context: RenderingContext) {
        const vNode = context.viewRegistry.get(shape.type, shape).render(shape, context)
        return context.viewer.decorate(vNode, shape)
    }
}

export abstract class GNodeView implements View {
    abstract render(model: GNode, context: RenderingContext): VNode

    abstract getAnchor(node: GNode, refPoint: Point, arrowLength: number)
}

export class StraightEdgeView implements View {
    render(edge: GEdge, context: RenderingContext) {
        const sourceView = (context.viewRegistry.get(edge.source.type, edge.source)) as GNodeView
        const sourceAnchor = sourceView.getAnchor(edge.source, edge.target, 0)
        const targetView = (context.viewRegistry.get(edge.target.type, edge.target)) as GNodeView
        const targetAnchor = targetView.getAnchor(edge.target, edge.source, 0)
        const path = `M ${sourceAnchor.x},${sourceAnchor.y} L ${targetAnchor.x},${targetAnchor.y}`
        return h('path', {
            key: edge.id,
            class: {
                edge: true
            },
            attrs: {
                d: path,
                id: edge.id,
            }
        })
    }
}
