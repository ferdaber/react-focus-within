### v2.0.1

*   Bug fixes:
    *   Safely check event objects in case events are dispatched with an undefined event parameter.

### v2.0.0

*   New features:
    *   An additional render prop is added called `getFocusProps`, which acts as a composer of your own event handlers for a `FocusWithin`-targeted component.
*   Bug fixes:
    *   Removed an unneeded import of `react-dom`.
    *   Fixed a bug where a `setState` could have been called after the component was unmounted.
*   Breaking change:
    *   `FocusWithin` now allows clicking within a `FocusWithin` container; i.e. it will no longer emit blur events for as long as mouse events are within that container. The `onBlur` event will only be emitted when DOM focus leaves the container **and** a mouse click happens outside the container (when both criteria are satisfied, the event is emitted).

### v0.1.0

*   Initial creation
