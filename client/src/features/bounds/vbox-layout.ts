/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { VNode } from "snabbdom/vnode"
import { isValidDimension } from '../../utils/geometry'
import { SParentElement } from "../../base/model/smodel"
import { StatefulLayouter } from './layout'
import { AbstractLayout } from './abstract-layout'
import { Layouting } from './model'

/**
 * CSS properties understood by the VBoxLayouter
 */
export interface VBoxProperties {
    lineHeight: number
    paddingTop: number
    paddingBottom: number
    paddingLeft: number
    paddingRight: number
    textAlign: string
}

export class VBoxLayouter extends AbstractLayout {
    static KIND = 'vbox'

    layout(container: SParentElement & Layouting,
           layouter: StatefulLayouter) {
        const boundsData = layouter.getBoundsData(container)
        const properties = this.getLayoutProperties(boundsData.vnode)
        const maxWidth = container.resizeContainer
            ? this.getMaxWidth(container, layouter)
            : Math.max(0, this.getFixedContainerBounds(container, layouter).width) - properties.paddingLeft - properties.paddingRight
        if (maxWidth > 0) {
            let y = this.layoutChildren(container, layouter, properties, maxWidth)
            if (container.resizeContainer) {
                boundsData.bounds = {
                    x: container.bounds.x,
                    y: container.bounds.y,
                    width: maxWidth + properties.paddingLeft + properties.paddingRight,
                    height: y - properties.lineHeight + properties.paddingBottom
                }
                boundsData.boundsChanged = true
            }
        }
    }

    protected getMaxWidth(container: SParentElement & Layouting,
                          layouter: StatefulLayouter) {
        let maxWidth = -1
        container.children.forEach(
            child => {
                const bounds = layouter.getBoundsData(child).bounds
                if (bounds !== undefined && isValidDimension(bounds))
                    maxWidth = Math.max(maxWidth, bounds.width)
            }
        )
        return maxWidth
    }

    protected layoutChildren(container: SParentElement & Layouting,
                             layouter: StatefulLayouter,
                             properties: VBoxProperties,
                             maxWidth: number) {
        let y = properties.paddingTop
        container.children.forEach(
            child => {
                const boundsData = layouter.getBoundsData(child)
                const bounds = boundsData.bounds
                const textAlign = this.getLayoutProperties(boundsData.vnode).textAlign
                if (bounds !== undefined && isValidDimension(bounds)) {
                    let dx = 0
                    if (textAlign === 'left')
                        dx = 0
                    else if (textAlign === 'center')
                        dx = 0.5 * (maxWidth - bounds.width)
                    else if (textAlign === 'right')
                        dx = maxWidth - bounds.width
                    boundsData.bounds = {
                        x: properties.paddingLeft + (child as any).bounds.x - bounds.x + dx,
                        y: y + (child as any).bounds.y - bounds.y,
                        width: bounds.width,
                        height: bounds.height
                    }
                    boundsData.boundsChanged = true
                    y += bounds.height + properties.lineHeight
                }
            }
        )
        return y
    }

    protected getLayoutProperties(vnode: VNode | undefined): VBoxProperties {
        const style = (vnode && vnode.elm) ? getComputedStyle(vnode.elm as any) : undefined
        return {
            lineHeight: this.getFloatValue(style, 'line-height', 1),
            paddingTop: this.getFloatValue(style, 'padding-top', 5),
            paddingBottom: this.getFloatValue(style, 'padding-bottom', 5),
            paddingLeft: this.getFloatValue(style, 'padding-left', 5),
            paddingRight: this.getFloatValue(style, 'padding-right', 5),
            textAlign: this.getStringValue(style, 'text-align', 'center')
        }
    }
}