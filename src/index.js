import React from 'react'
import PropTypes from 'prop-types'

export class FocusWithin extends React.Component {
    static propTypes = {
        onBlur: PropTypes.func,
        onFocus: PropTypes.func
    }

    state = {
        isFocused: false
    }

    componentDidUpdate(_, prevState) {
        if (prevState.isFocused && !this.state.isFocused) {
            this.isBlurring = true
            setTimeout(() => {
                this.isBlurring = false
                // check if the focus manager is actually blurred for times
                // when document click causes a consective blur -> focus
                if (!this.state.isFocused && this.props.onBlur) {
                    this.props.onBlur()
                }
            })
        }
        // check if the focus manager was focused from the outside
        // and not from another child element
        if (!this.isBlurring && !prevState.isFocused && this.state.isFocused && this.props.onFocus) {
            this.props.onFocus()
        }
    }

    render() {
        return this.props.children
            ? this.props.children({
                  focusProps: {
                      onBlur: () => this.setState({ isFocused: false }),
                      onFocus: () => this.setState({ isFocused: true })
                  },
                  isFocused: this.state.isFocused
              })
            : null
    }
}

export default FocusWithin
