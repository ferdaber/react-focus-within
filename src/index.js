import React from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import PropTypes from 'prop-types'

export function withFocusWithin(Component) {
    const WrappedComponent = ({ onFocus, onBlur, ...props }) => (
        <FocusWithin onFocus={onFocus} onBlur={onBlur}>
            {({ focusProps, isFocused }) =>
                typeof Component === 'string' ? (
                    <Component {...props} {...focusProps} />
                ) : (
                    <Component {...props} {...focusProps} isFocused={isFocused} />
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
        onFocus: PropTypes.func
    }

    static defaultProps = {
        onBlur: () => {},
        onFocus: () => {}
    }

    static wrapComponent = withFocusWithin

    state = {
        isBlurring: false,
        isFocused: false
    }

    setFocusState = isFocused => event => {
        // delay processing native events for one turn of the event loop
        // to have it be on the same timing as FocusWithin events
        const setStateCb = () => {
            if (this.isUnmounted) return
            this.setState(
                state =>
                    state.isFocused === isFocused
                        ? state
                        : !isFocused
                            ? {
                                  isFocused,
                                  isBlurring: true
                              }
                            : {
                                  isFocused
                              }
            )
        }
        if (event && event.__isFocusWithinEvent) {
            setStateCb()
        } else {
            setTimeout(setStateCb)
        }
    }

    blur = this.setFocusState(false)

    focus = this.setFocusState(true)

    componentDidUpdate(_, prevState) {
        if (prevState.isFocused && !this.state.isFocused) {
            setTimeout(() => {
                this.setState({
                    isBlurring: false
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
            setTimeout(() => {
                this.props.onFocus({ __isFocusWithinEvent: true })
            })
        }
    }

    componentWillUnmount() {
        this.isUnmounted = true
    }

    render() {
        return this.props.children
            ? this.props.children({
                  focusProps: {
                      onBlur: this.blur,
                      onFocus: this.focus
                  },
                  // stabilize isFocused so that it only changes corresponding to its event emissions
                  isFocused: this.state.isFocused || this.state.isBlurring
              })
            : null
    }
}

export default FocusWithin
