import React from 'react'
import PropTypes from 'prop-types'

export function withFocusWithin(Component) {
    const WrappedComponent = ({ onFocus, onBlur, ...props }) => (
        <FocusWithin onFocus={onFocus} onBlur={onBlur}>
            {({ getFocusProps, isFocused }) =>
                typeof Component === 'string' ? (
                    <Component {...getFocusProps(props)} />
                ) : (
                    <Component {...getFocusProps(props)} isFocused={isFocused} />
                )
            }
        </FocusWithin>
    )
    WrappedComponent.displayName = `WithFocusWithin(${Component.displayName || Component.name || 'Component'})`
    return WrappedComponent
}

export class FocusWithin extends React.Component {
    static propTypes = {
        onBlur: PropTypes.func,
        onFocus: PropTypes.func,
    }

    static defaultProps = {
        onBlur: () => {},
        onFocus: () => {},
    }

    static wrapComponent = withFocusWithin

    state = {
        isBlurring: false,
        isFocused: false,
    }

    // delay by one turn of the event loop, used to consolidate timing between
    // FocusWithin events and native events
    delay = (cb, ...args) =>
        setTimeout(() => {
            if (this.isUnmounted) {
                return
            }
            cb(...args)
        })

    setFocusState = (isFocused, isFocusWithinEvent) => {
        const setStateCb = () => {
            if (this.isUnmounted) return
            this.setState(
                state =>
                    state.isFocused === isFocused
                        ? state
                        : !isFocused
                            ? {
                                  isFocused,
                                  isBlurring: true,
                              }
                            : {
                                  isFocused,
                              }
            )
        }
        // delay processing native events for one turn of the event loop
        // to have it be on the same timing as FocusWithin events
        if (isFocusWithinEvent) {
            setStateCb()
        } else {
            this.delay(setStateCb)
        }
    }

    // track mouse activity within the FocusWithin container, which allows clicking inside it
    // whenever a mousedown occurs we save the current container element, and if on mouseup
    // we are outside the container, we emit the blur event appropriately
    // mouseups can still occur outside the container with actual DOM focus remaining within
    // so we do not emit blurs for those
    onDocumentMouseUp = event => {
        const container = this.mouseDownWithinTarget
        const mouseUpWithinTarget = container && container.contains(event.target)
        const activeElementWithinTarget = container && container.contains(document.activeElement)
        if (!activeElementWithinTarget && !mouseUpWithinTarget) {
            this.setFocusState(false, this.lastBlurEvent ? this.lastBlurEvent.__isFocusWithinEvent : true)
        }
        this.mouseDownWithinTarget = null
        this.lastBlurEvent = null
    }

    getFocusProps = ({ onFocus, onBlur, onMouseDown, ...props } = {}) => {
        return {
            ...props,
            onFocus: event => {
                const propagationStopped = onFocus && onFocus(event) === false
                if (propagationStopped || (event && event.focusWithinDefaultPrevented)) {
                    return
                }
                this.setFocusState(true, event && event.__isFocusWithinEvent)
            },
            onBlur: event => {
                const propagationStopped = onBlur && onBlur(event) === false
                if (propagationStopped || (event && event.focusWithinDefaultPrevented)) {
                    return
                }
                // if blur event happens right after a mousedown of an element inside the FocusWithin container
                // we don't emit the blur event immediately and check if we should emit it later after the mouseup occurs
                if (this.mouseDownWithinTarget) {
                    event.persist && event.persist()
                    this.lastBlurEvent = event
                    return
                }
                this.setFocusState(false, event && event.__isFocusWithinEvent)
            },
            onMouseDown: event => {
                const propagationStopped = onMouseDown && onMouseDown(event) === false
                if (propagationStopped || (event && event.focusWithinDefaultPrevented)) {
                    return
                }
                this.mouseDownWithinTarget = event.currentTarget
            },
        }
    }

    componentDidMount() {
        document.addEventListener('mouseup', this.onDocumentMouseUp)
    }

    componentDidUpdate(_, prevState) {
        if (prevState.isFocused && !this.state.isFocused) {
            this.delay(() => {
                if (this.isUnmounted) {
                    return
                }
                this.setState({
                    isBlurring: false,
                })
                // check if the focus manager is actually blurred for times
                // when document click causes a consective blur -> focus
                if (!this.state.isFocused) {
                    this.props.onBlur({ __isFocusWithinEvent: true })
                }
            })
        }
        // check if the focus manager was focused from the outside
        // and not from another child element
        // delay onfocus emission to be on the same timing as blur events
        if (!this.state.isBlurring && !prevState.isFocused && this.state.isFocused) {
            this.delay(this.props.onFocus, { __isFocusWithinEvent: true })
        }
    }

    componentWillUnmount() {
        this.isUnmounted = true
        document.removeEventListener('mouseup', this.onDocumentMouseUp)
    }

    render() {
        return this.props.children
            ? this.props.children({
                  focusProps: this.getFocusProps(),
                  getFocusProps: this.getFocusProps,
                  // stabilize isFocused so that it only changes corresponding to its event emissions
                  isFocused: this.state.isFocused || this.state.isBlurring,
              })
            : null
    }
}

export default FocusWithin
