'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Mask = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.maskValue = maskValue;
exports.unmaskValue = unmaskValue;

require('core-js/fn/array/includes');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               Masked field
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               A masked field is an enhanced input field that provides visual and non-visual
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               cues to a user about the expected value.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               Style guide: components.masked-field
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */


// Deliminate chunks of integers
var deliminatedMaskRegex = {
  phone: /(\d{3})(\d{1,3})?(\d+)?/,
  ssn: /([*\d]{3})([*\d]{1,2})?([*\d]+)?/,
  zip: /(\d{5})(\d*)/
};

/**
 * Split value into groups and insert a hyphen deliminator between each
 * @param {String} value
 * @param {RegExp} rx - Regular expression with capturing groups
 * @returns {String}
 */
function deliminateRegexGroups(value, rx) {
  var matches = toDigitsAndAsterisks(value).match(rx);
  if (matches && matches.length > 1) {
    value = matches.slice(1).filter(function (a) {
      return !!a;
    }) // remove undefined groups
    .join('-');
  }

  return value;
}

/**
 * Format a string using fixed-point notation, similar to Number.prototype.toFixed
 * though a decimal is only fixed if the string included a decimal already
 * @param {String} value - A stringified number (i.e. "1234")
 * @param {Number} digits - The number of digits to appear after the decimal point
 * @returns {String}
 */
function stringWithFixedDigits(value) {
  var digits = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

  var decimalRegex = /\.[\d]+$/;

  // Check for existing decimal
  var decimal = value.match(decimalRegex);

  if (decimal) {
    var fixedDecimal = parseFloat(decimal).toFixed(digits).match(decimalRegex)[0];

    return value.replace(decimal, fixedDecimal);
  }

  return value;
}

/**
 * Remove everything that isn't a digit or asterisk
 * @param {String} value
 * @returns {String}
 */
function toDigitsAndAsterisks(value) {
  return value.replace(/[^\d*]/g, '');
}

/**
 * Remove all non-digits
 * @param {String} value
 * @returns {String}
 */
function toDigits(value) {
  return value.replace(/[^\d]/g, '');
}

/**
 * Convert string into a number (positive or negative float or integer)
 * @param {String} value
 * @returns {Number}
 */
function toNumber(value) {
  var sign = value.charAt(0) === '-' ? -1 : 1;
  var parts = value.split('.');
  // This assumes if the user adds a "." it should be a float. If we want it to
  // evaluate as an integer if there are no digits beyond the decimal, then we
  // can change it.
  var hasDecimal = parts[1] !== undefined;
  if (hasDecimal) {
    var a = toDigits(parts[0]);
    var b = toDigits(parts[1]);
    return sign * parseFloat(a + '.' + b);
  } else {
    return sign * parseInt(toDigits(parts[0]));
  }
}

/**
 * Determines if a value is a valid string with numeric digits
 * @param {String} value
 * @param {String} mask
 * @returns {Boolean}
 */
function isValueMaskable(value, mask) {
  if (value && typeof value === 'string') {
    var hasDigits = value.match(/\d/);
    var hasDigitsAsterisks = value.match(/[\d*]/g);
    if (hasDigits || hasDigitsAsterisks && mask === 'ssn') {
      return true;
    }
  }
  return false;
}

/**
 * Returns the value with additional masking characters, or the same value back if invalid numeric string
 * @param {String} value
 * @returns {String}
 */
function maskValue() {
  var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var mask = arguments[1];

  if (isValueMaskable(value, mask)) {
    if (mask === 'currency') {
      // Format number with commas. If the number includes a decimal,
      // ensure it includes two decimal points
      var number = toNumber(value);
      if (number !== undefined) {
        value = stringWithFixedDigits(number.toLocaleString('en-US'));
      }
    } else if (deliminatedMaskRegex[mask]) {
      // Use deliminator regex to mask value and remove unwanted characters
      // If the regex does not match, return the numeric digits.
      value = deliminateRegexGroups(value, deliminatedMaskRegex[mask]);
    }
  }

  return value;
}

/*
`<TextField mask={...}>`

Passing a `mask` prop into the `TextField` component with a valid value will
enable formatting to occur when the field is blurred. To "unmask" the
value, you can import and call the `unmaskValue` method.

@react-component TextField

@react-example Mask

Style guide: components.masked-field.react
*/

/**
 * A Mask component renders a controlled input field. When the
 * field is blurred, it applies formatting to improve the readability
 * of the value.
 */

var Mask = exports.Mask = function (_React$PureComponent) {
  _inherits(Mask, _React$PureComponent);

  function Mask(props) {
    _classCallCheck(this, Mask);

    var _this = _possibleConstructorReturn(this, (Mask.__proto__ || Object.getPrototypeOf(Mask)).call(this, props));

    var field = _this.field();
    var initialValue = field.props.value || field.props.defaultValue;

    _this.state = {
      value: maskValue(initialValue, props.mask)
    };
    return _this;
  }

  _createClass(Mask, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (this.debouncedOnBlurEvent) {
        this.field().props.onBlur(this.debouncedOnBlurEvent);
        this.debouncedOnBlurEvent = null;
      }

      var fieldProps = this.field().props;
      var prevFieldProps = _react2.default.Children.only(prevProps.children).props;
      var isControlled = fieldProps.value !== undefined;
      if (isControlled && prevFieldProps.value !== fieldProps.value) {
        var mask = this.props.mask;
        // For controlled components, the value prop should ideally be changed by
        // the controlling component once we've called onChange with our updates.
        // If the change was triggered this way through user input, then the prop
        // given should match our internal state when unmasked. If what we're
        // given and what we have locally don't match, that means the controlling
        // component has made its own unrelated change, so we should update our
        // state and mask this new value.

        if (unmaskValue(fieldProps.value, mask) !== unmaskValue(this.state.value, mask)) {
          var value = maskValue(fieldProps.value || '', mask);
          this.setState({ value: value }); // eslint-disable-line react/no-did-update-set-state
        }
      }
    }

    /**
     * Get the child text field. Called as a method so that
     * updates to the field cause the mask to re-render
     * @returns {React.ReactElement} Child TextField
     */

  }, {
    key: 'field',
    value: function field() {
      return _react2.default.Children.only(this.props.children);
    }

    /**
     * To avoid a jarring experience for screen readers, we only
     * add/remove characters after the field has been blurred,
     * rather than when the user is typing in the field
     * @param {Object} evt
     * @param {React.Element} field - Child TextField
     */

  }, {
    key: 'handleBlur',
    value: function handleBlur(evt, field) {
      var value = maskValue(evt.target.value, this.props.mask);

      // We only debounce the onBlur when we know for sure that
      // this component will re-render (AKA when the value changes)
      // and when an onBlur callback is present
      var debounce = value !== this.state.value && typeof field.props.onBlur === 'function';

      if (debounce) {
        // We need to retain a reference to the event after the callback
        // has been called. We pass this onto the consuming app's onBlur
        // only after the value has been manipulated – this way, the
        // value returned by event.target.value is the value after masking
        evt.persist();
        this.debouncedOnBlurEvent = evt;
      }

      this.setState({
        value: value
      });

      if (!debounce && typeof field.props.onBlur === 'function') {
        // If we didn't debounce the onBlur event, then we need to
        // call the onBlur callback from here
        field.props.onBlur(evt);
      }
    }

    /**
     * @param {Object} evt
     * @param {React.Element} field - Child TextField
     */

  }, {
    key: 'handleChange',
    value: function handleChange(evt, field) {
      this.setState({ value: evt.target.value });

      if (typeof field.props.onChange === 'function') {
        field.props.onChange(evt);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var field = this.field();

      return _react2.default.cloneElement(field, {
        defaultValue: undefined,
        onBlur: function onBlur(evt) {
          return _this2.handleBlur(evt, field);
        },
        onChange: function onChange(evt) {
          return _this2.handleChange(evt, field);
        },
        value: this.state.value
      });
    }
  }]);

  return Mask;
}(_react2.default.PureComponent);

Mask.propTypes = {
  /** Pass the input as the child */
  children: _propTypes2.default.node.isRequired,
  mask: _propTypes2.default.string.isRequired
};

/**
 * Remove mask characters from value, or the same value back if invalid numeric string
 * @param {String} value
 * @param {String} mask
 * @returns {String}
 */
function unmaskValue(value, mask) {
  if (isValueMaskable(value, mask)) {
    if (mask === 'currency') {
      // Preserve only digits, decimal point, or negative symbol
      var matches = value.match(/^-|[\d.]/g);
      if (matches) {
        value = matches.join('');
      }
    } else if (deliminatedMaskRegex[mask]) {
      // Remove the deliminators and revert to single ungrouped string
      value = toDigitsAndAsterisks(value);
    }
  }

  return value;
}

exports.default = Mask;