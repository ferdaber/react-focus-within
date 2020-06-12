import { ComponentClass, ComponentType, ReactNode, ReactHTML, StatelessComponent } from 'react'

interface FocusProps {
    onFocus(event: object): void
    onBlur(event: object): void
    onMouseDown(event: object): void
}

export interface FocusWithinRenderProps {
    focusProps: FocusProps
    getFocusProps<P>(
        props?: P
    ): FocusProps & P
    isFocused: boolean
}

export interface FocusWithinProps {
    onFocus?(event: {}): void
    onBlur?(event: {}): void
    children?(renderProps: FocusWithinRenderProps): ReactNode
}

declare function withFocusWithin<P>(Component: ComponentType<P>): StatelessComponent<P>
declare function withFocusWithin<P extends keyof ReactHTML>(NativeComponent: P): ReactHTML[P]

interface FocusWithinComponent extends ComponentClass<FocusWithinProps> {
    wrapComponent: typeof withFocusWithin
}

export const FocusWithin: FocusWithinComponent
export { withFocusWithin }
export default FocusWithin
