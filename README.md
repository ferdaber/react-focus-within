A React component that gives you `:focus-within` behavior.

### Table of Contents

*   [Why?](#why)
*   [Setup](#setup)
*   [API](#api)
    * [`<FocusWithin>` component](#focuswithin-component)
    * [withFocusWithin()](#withfocuswithin)
    * [Props](#props)
*   [Simple Usage](#simple-usage)
*   [Event Handling](#event-handling)
*   [Nesting](#nesting)
*   [Mixed FocusWithin components](#mixed-focuswithin-components)

### Why?

Focus management across children is a pain to manage until browsers implement the `:focus-within` pseudoselector. Use this if you have run into some of these issues:

*   You want to style a container differently based on if the user has one of its child elements focused (simply using a `:focus` pseudoselector on the container will not work).
*   You want to know if a user has left a form but not when a user is simply moving between the form elements inside it.
*   You want to style an element based on the focus state of two intricately linked elements, but those elements are not near each other on the DOM tree (imagine a button that opens a fixed popup at the root, even though they are physically placed next to each other)

Note that unlike native DOM `focus` and `blur` events, the `onFocus` and `onBlur` events in React bubble, this means that you can usually get away with those event handlers if you want to simply react to those events, however you will still not be able to apply the `:focus` pseudoselector unless it is the exact element being focused. Using `FocusWithin` can save you time:

```jsx
//without FocusWithin
class Form extends React.Component {
    state = {
        isFocused: false,
    }

    render() {
        // color the form if either the input or button are focused
        return (
            <form
                style={{ background: this.state.isFocused ? focusedBackgroundColor : 'none' }}
                onFocus={() => this.setState({ isFocused: true })}
                onBlur={() => this.setState({ isFocused: false })}
            >
                <input />
                <button>Submit</button>
            </form>
        )
    }
}

// with FocusWithin
const Form = () => (
    <FocusWithin>
        {({ isFocused, focusProps }) => (
            <form {...focusProps} style={{ background: isFocused ? focusedBackgroundColor : 'none' }}>
                <input />
                <button>Submit</button>
            </form>
        )}
    </FocusWithin>
)

// works very well with CSS-in-JS
const StyledForm = withFocusWithin(styled.div`
    background: ${props => (props.isFocused ? focusedBackgroundColor : 'none')};
`)

const Form = () => (
    <StyledForm>
        <input />
        <button>Submit</button>
    </StyledForm>
)
```

### Setup

```
npm install react-focus-within
```

```js
// <FocusWithin> component
import FocusWithin from 'react-focus-within'
import { FocusWithin } from 'react-focus-within'

// withFocusWithin() higher-order component
import { withFocusWithin } from 'react-focus-within'
```

### API

#### `<FocusWithin>` component
`FocusWithin` expects `children` to be a function that is passed an object containing `focusProps` and `isFocused`. Spread `focusProps` over all children that you want to manage (i.e. any focusable element inside it that can contribute to the focus state). The `isFocused` boolean will tell you if the user has any of these children focused.

Note that `isFocused` is guaranteed to be stable, meaning that if focus is transitioning from one element to another from inside a managed child, `isFocused` will not be set to `false` and then `true` consecutively. This can be very useful if you are rendering some elements conditionally based on `isFocused`, which ensures that React does not unmount those components needlessly, causing state to be lost.

```jsx
import { FocusWithin } from 'react-focus-within'

// the form container will be highlighted red if either the input or the button are focused
const Form = () => (
    <FocusWithin>
        {({ focusProps, isFocused }) => (
            <div
                {...focusProps}
                style={{
                    // you can also pass in a special class name depending on isFocused
                    // which would be the more maintainable CSS way
                    border: isFocused ? '1px solid red' : 'none',
                }}
            >
                <form>
                    <input />
                    <button>Submit</button>
                </form>
            </div>
        )}
    </FocusWithin>
)
```

#### withFocusWithin()
`FocusWithin` can also be used as a higher order component, wrapping a container such that it reacts to all of its children's focus events and it will receive a prop called `isFocused` when anything in its React subtree is focused (this includes portals in React 16).

`withFocusWithin(Component) => ReactComponent` - use as a quick wrapper around a container component, the container element will receive an `isFocused` prop if any of its children are focused. The `isFocused` prop will not be passed in if you are wrapping a native DOM component, since it does not understand `isFocused` as an attribute.

`FocusWithin.wrapComponent` - this is exactly the same as `withFocusWithin`

When combined with CSS-in-JS constructs, this can lead to very awesome and convenient styling:

```jsx
import { withFocusWithin } from 'react-focus-within'
import styled from 'styled-components'

const FormSection = withFocusWithin(styled.div`
    background: ${props => (props.isFocused ? props.focusedColor || 'gray' : 'none')};
`)

const BigForm = () => (
    <div>
        <FormSection focusedColor="lightblue">
            <input placeholder="Section A" />
            <button>Submit</button>
        </FormSection>
        <FormSection focusedColor="tomato">
            <input placeholder="Section B" />
            <button>Submit</button>
        </FormSection>
        <FormSection focusedColor="hotpink">
            <input placeholder="Section C" />
            <button>Submit</button>
        </FormSection>
    </div>
)
```

#### Props
Both `FocusWithin` and `withFocusWithin` have the following props:
*   `onFocus: (event) => void` - called when focus moves from outside into a managed child. Not called when moving between children.
*   `onBlur: (event) => void` - called when focus moves from inside a managed child to outside. Not called when moving between children.
*   `children: (renderProps) => JSX.Element` - pass in a function as the child of `FocusWithin`. The shape of renderProps is this:

```ts
type renderProps = {
    focusProps: {
        onBlur: Function
        onFocus: Function
    }
    getFocusProps<P>({originalProps: P}): {
        onBlur: Function
        onFocus: Function
        onMouseDown: Function
    } & P
    isFocused: boolean
}
```

> ℹ️ You can use `getFocusProps` if you plan on implementing other effects for the following events: `onBlur`, `onFocus`, and `onMouseDown`. By passing those into `getFocusProps` it will call your event handlers first before its own. You can prevent default behavior of `FocusWithin` handlers by setting `event.focusWithinDefaultPrevented = true` or returning `false` in the event handler itself. `focusProps` is just a shorthand that calls `getFocusProps` with an empty object.

> ⚠️ If you are wrapping the event handlers in `focusProps` before applying it to managed children, make sure to pass the native `event` object back to the original `onBlur` and `onFocus` events. `FocusWithin` relies on this to determine if an event was emitted from a native DOM element or a nested `FocusWithin` element.

### Event Handling

Both `FocusWithin` and `withFocusWithin` emit `onFocus` and `onBlur` events when the user enters or leaves their managed children; they will not emit events when a user goes from one managed child to another.
**You will not need this much power most of the time unless you need precise timing and frequency of `onFocus` and `onBlur` event emissions.**

```jsx
import { FocusWithin } from 'react-focus-within'

// the form container will only emit onFocus and onBlur if they completely leave the form
// it will not emit either events if they are moving focus between the input and the button
// which is different than the default React behavior
const Form = () => (
    <FocusWithin
        onFocus={() => console.log('Someone is trying to enter things into me!')}
        onBlur={() => console.log('Someone left the form, better validate it!')}
    >
        {({ focusProps, isFocused }) => (
            <div
                style={{
                    border: isFocused ? '1px solid red' : 'none',
                }}
            >
                <form>
                    <input {...focusProps} />
                    <button {...focusProps}>Submit</button>
                </form>
            </div>
        )}
    </FocusWithin>
)
```

### Nesting

Because `FocusWithin` itself will emit `onFocus` and `onBlur` events, you can nest multiple `FocusWithin`s. This can be handy when you want to segregate focus states in a composite UI.

```jsx
import { FocusWithin } from 'react-focus-within'
import Form from 'example-above'

// if the user is inside the second form, the overall container will have a background,
// but only the second form will have a red border
const BigForm = () => (
    <FocusWithin>
        {({ focusProps, isFocused }) => (
            <div
                {...focusProps}
                style={{
                    background: isFocused ? 'gray' : 'none',
                }}
            >
                <Form />
                <Form />
                <Form />
            </div>
        )}
    </FocusWithin>
)
```

### Mixed FocusWithin components
Currently, mixing managed `FocusWithin`s and other managed component types is not supported.

**Why is this?** This is due to how native or passthrough `onBlur` and `onFocus` events are triggered immediately by React, whereas the `onBlur` and `onFocus` events triggered by other `FocusWithin` components are delayed by a `setTimeout` to determine if focus actually has changed inside it, which can lead to out-of-order event triggering when the two are mixed. **Again, you should not be encountering this in common usage.**

```jsx
const MixedForm = () => (
    <FocusWithin>
        {({ focusProps, isFocused }) => (
            <div
                style={{
                    background: isFocused ? 'gray' : 'none',
                }}
            >
                {/* this will not work correctly */}
                <Form {...focusProps} />
                <Form {...focusProps} />
                <input {...focusProps} />

                {/* these will work */}
                <Form {...focusProps} />
                <Form {...focusProps} />
                <Form {...focusProps} />

                {/* these will work too */}
                <input {...focusProps} />
                <input {...focusProps} />
                <input {...focusProps} />
            </div>
        )}
    </FocusWithin>
)
```

You should not run into this problem most of the time; you can just spread `focusProps` to the container that you want to style since `onFocus` and `onBlur` will bubble up to it.

If you still need to individually manage each child, you will have to wrap the non-`FocusWithin` managed children inside one. The module exports an HOC function called `withFocusWithin` and a static method in `FocusWithin` called `wrapComponent` (they are the same) to help with that:

```jsx
const WrappedNativeInput = FocusWithin.wrapComponent('input') // same as withFocusWithin('input')
const WrappedOtherComponent = FocusWithin.wrapComponent(OtherComponent) // same as withFocusWithin(OtherComponent)

const OkayMixedForm = () => (
    <FocusWithin>
        {({ focusProps, isFocused }) => (
            <div
                style={{
                    background: isFocused ? 'gray' : 'none',
                }}
            >
                <Form {...focusProps} />
                <WrappedNativeInput {...focusProps} />
                <WrappedOtherComponent {...focusProps} />

                {/* equivalent to: */}
                <Form {...focusProps} />
                <FocusWithin {...focusProps}>{({ focusProps }) => <input {...focusProps} />}</FocusWithin>
                <FocusWithin {...focusProps}>{({ focusProps }) => <OtherComponent {...focusProps} />}</FocusWithin>
            </div>
        )}
    </FocusWithin>
)
```
