A React component that gives you `:focus-within` behavior.

### Why?

Focus management across children is a pain to manage until browsers implement the `:focus-within` pseudoselector. Use this if you have run into some of these issues:

*   You want to style a container differently based on if the user has one of its child elements focused (simply using a `:focus` pseudoselector on the container will not work).
*   You want to know if a user has left a form but not when a user is simply moving between the form elements inside it.
*   You want to style an element based on the focus state of two intricately linked elements, but those elements are not near each other on the DOM tree (imagine a button that opens a fixed popup at the root, even though they are physically placed next to each other)

### Why Not?

Note that unlike native DOM `focus` and `blur` events, the `onFocus` and `onBlur` events in React bubble, this means that you can usually get away with those event handlers if you want to simply react to those events, however you will still not be able to apply the `:focus` pseudoselector unless it is the exact element being focused. Using `FocusWithin` can save you time:

```jsx
//without FocusWithin
class Form extends React.Component {
    state = {
        isFocused: false
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

// with FocusWIthin
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
```

### Setup

```
npm install react-focus-within
```

### Simple Usage

`FocusWithin` uses `children` as a function that is passed an object containing `focusProps` and `isFocused`, the `focusProps` should be spread over all children that you want to manage (i.e. any focusable element inside it that can contribute to the focus state), the `isFocused` boolean is the main payload of the component and will tell you if the user has any of them focused.

```jsx
import { FocusWithin } from 'react-focus-within'

// the form container will be highlighted red if either the input or the button are focused
const Form = () => (
    <FocusWithin>
        {({ focusProps, isFocused }) => (
            <div
                style={{
                    border: isFocused ? '1px solid red' : 'none'
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

### Event Handling

`FocusWithin` emits `onFocus` and `onBlur` events when the user enters or leaves its managed children, it will not emit events when a user goes from one managed child to another.

```jsx
import { FocusWithin } from 'react-focus-within'

// the form container will emit events correctly when a user enters or leaves it
const Form = () => (
    <FocusWithin
        onFocus={() => console.log('Someone is trying to enter things into me!')}
        onBlur={() => console.log('Someone left the form, better validate it!')}
    >
        {({ focusProps, isFocused }) => (
            <div
                style={{
                    border: isFocused ? '1px solid red' : 'none'
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

Because `FocusWithin` itself will emit `onFocus` and `onBlur` events, you can nest multiple `FocusWithin`s! This can be handy when you want to segregate focus states in a composite UI.

```jsx
import { FocusWithin } from 'react-focus-within'

const Form = ({ onBlur, onFocus }) => (
    <FocusWithin onBlur={onBlur} onFocus={onFocus}>
        {({ focusProps, isFocused }) => (
            <div
                style={{
                    border: isFocused ? '1px solid red' : 'none'
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

// if the user is inside the second form, the overall container will have a background,
// but only the second form will have a red border
const BigForm = () => (
    <FocusWithin>
        {({ focusProps, isFocused }) => (
            <div
                style={{
                    background: isFocused ? 'gray' : 'none'
                }}
            >
                <Form {...focusProps} />
                <Form {...focusProps} />
                <Form {...focusProps} />
            </div>
        )}
    </FocusWithin>
)
```

Currently, mixing managed `FocusWithin`s and other managed component types is not supported:

```jsx
// this will not work correctly
const MixedForm = () => (
    <FocusWithin>
        {({ focusProps, isFocused }) => (
            <div
                style={{
                    background: isFocused ? 'gray' : 'none'
                }}
            >
                <Form {...focusProps} />
                <Form {...focusProps} />
                <input {...focusProps} />
            </div>
        )}
    </FocusWithin>
)

// these will work fine because all managed children are either nested FocusWithin's or other components
const OkayForm = () => (
    <FocusWithin>
        {({ focusProps, isFocused }) => (
            <div
                style={{
                    background: isFocused ? 'gray' : 'none'
                }}
            >
                <Form {...focusProps} />
                <Form {...focusProps} />
                <input />
            </div>
        )}
    </FocusWithin>
)
const OkayFormToo = () => (
    <FocusWithin>
        {({ focusProps, isFocused }) => (
            <div
                style={{
                    background: isFocused ? 'gray' : 'none'
                }}
            >
                <Form />
                <input {...focusProps} />
                <input {...focusProps} />
            </div>
        )}
    </FocusWithin>
)
```

If you still want it to work correctly, you will have to wrap the non-`FocusWithin` managed children inside one, to help with that there is a static HOC method available in `FocusWithin` called `wrapComponent`:

```jsx
const WrappedNativeInput = FocusWithin.wrapComponent('input')
const WrappedOtherComponent = FocusWithin.wrapComponent(OtherComponent)

const OkayMixedForm = () => (
    <FocusWithin>
        {({ focusProps, isFocused }) => (
            <div
                style={{
                    background: isFocused ? 'gray' : 'none'
                }}
            >
                <Form {...focusProps} />
                <WrappedNativeInput {...focusProps} />
                <WrappedOtherComponent {...focusProps} />
            </div>
        )}
    </FocusWithin>
)

// above is equivalent to this but is shorter
const AlsoOkayMixedForm = () => (
    <FocusWithin>
        {({ focusProps, isFocused }) => (
            <div
                style={{
                    background: isFocused ? 'gray' : 'none'
                }}
            >
                <Form {...focusProps} />
                <FocusWithin {...focusProps}>{({ focusProps }) => <input {...focusProps} />}</FocusWithin>
                <FocusWithin {...focusProps}>{({ focusProps }) => <OtherComponent {...focusProps} />}</FocusWithin>
            </div>
        )}
    </FocusWithin>
)
```

**Why is this?** This is due to how native or passthrough `onBlur` and `onFocus` events are triggered immediately by React, whereas the `onBlur` and `onFocus` events triggered by other `FocusWithin` components are delayed by a `setTimeout` to determine if focus actually has changed inside it, which can lead to out-of-order event triggering when the two are mixed. _This solution is not great_ and if you have any suggestions, feel free to open a PR!

### Props API

*   `onFocus: (event) => void` - called when focus moves from outside into a managed child. Not called when moving between children.
*   `onBlur: (event) => void` - called when focus moves from inside a managed child to outside. Not called when moving between children.
*   `children: (renderProps) => JSX.Element` - pass in a function as the child of `FocusWithin`, the shape of renderProps is this:

```ts
type renderProps = {
    focusProps: {
        onBlur: Function
        onFocus: Function
    }
    isFocused: boolean
}
```

> ⚠️ If you are wrapping the event handlers in `focusProps` before applying it to managed children, make sure to pass the native `event` object back to the original `onBlur` and `onFocus` events, `FocusWithin` relies on this to determine if an event was emitted from a native DOM element or a nested `FocusWithin` element

### Static API

*   `FocusWithin.wrapComponent(Component) => ReactComponent` - use as a workaround to quickly wrap a non-`FocusWithin` component for use when mixing managed `FocusWithin` children with other component types that are managed.
