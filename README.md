A React component that gives you `:focus-within` behavior.

### Why?

Focus management across children is a pain to manage until browsers implement the `:focus-within` pseudoselector. Use this if you have run into some of these issues:

*   You want to style a container differently based on if the user has one of its child elements focused (simply using a `:focus` pseudoselector on the container will not work).
*   You want to know if a user has left a form but not when a user is simply moving between the form elements inside it.
*   You want to style an element based on the focus state of two intricately linked elements, but those elements are not near each other on the DOM tree (imagine a button that opens a fixed popup at the root, even though they are physically placed next to each other)

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

### Props API

*   `onFocus: () => void` - called when focus moves from outside into a managed child. Not called when moving between children
*   `onBlur: () => void` - called when focus moves from inside a managed child to outside. Not called when moving between children
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
