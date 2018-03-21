import { ComponentClass, ComponentType, ReactNode, ReactHTML, StatelessComponent } from 'react'

export interface FocusWithinRenderProps {
    focusProps: {
        onFocus(event?: object): void
        onBlur(event?: object): void
    }
    isFocused: boolean
}

export interface FocusWithinProps {
    onFocus?(event?: object): void
    onBlur?(event?: object): void
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
