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
    WrappedComponent.displayName = `WithFocusWithin({Component.displayName || Component.name || 'Component'})`
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

    static wrapComponent = wrapComponent

    state = {
        isFocused: false
    }

    delayedSetState = newState => event => {
        const eventType = newState.isFocused ? 'focus' : 'blur'
        const setStateCb = () =>
            this.setState(state => {
                if (state.isFocused === newState.isFocused) {
                    return state
                }
                return newState
            })
        if (event && event.__isFocusWithinEvent) {
            setStateCb()
        } else {
            setTimeout(setStateCb)
        }
    }

    componentDidUpdate(_, prevState) {
        if (prevState.isFocused && !this.state.isFocused) {
            this.isBlurring = true
            setTimeout(() => {
                this.isBlurring = false
                // check if the focus manager is actually blurred for times
                // when document click causes a consective blur -> focus
                if (!this.state.isFocused) {
                    this.props.onBlur({ __isFocusWithinEvent: true })
                }
            })
        }
        // check if the focus manager was focused from the outside
        // and not from another child element
        if (!this.isBlurring && !prevState.isFocused && this.state.isFocused) {
            // delay onfocus emission here to be consistent with how blurring works
            // focusing from one FocusWithin to another will preserve the order: focus
            // on the target gets emitted before the blur on the source
            setTimeout(() => {
                this.props.onFocus({ __isFocusWithinEvent: true })
            })
        }
    }

    render() {
        return this.props.children
            ? this.props.children({
                  focusProps: {
                      onBlur: this.delayedSetState({ isFocused: false }),
                      onFocus: this.delayedSetState({ isFocused: true })
                  },
                  isFocused: this.state.isFocused
              })
            : null
    }
}

export default FocusWithin
