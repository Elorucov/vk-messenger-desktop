var e
;(e = function () {
  'use strict'
  var e,
    t,
    n,
    o,
    r,
    i,
    a,
    s,
    c,
    u,
    l,
    h,
    f,
    d,
    v,
    m,
    p,
    y,
    g,
    b,
    E,
    S = (function () {
      var e
      function t() {
        var e, n, o
        ;(function (e, t) {
          if (!(e instanceof t))
            throw TypeError('Cannot call a class as a function')
        })(this, t),
          (n = 'events'),
          (e = e || Object.create(null)),
          (o = {
            on: function (t, n) {
              ;(e[t] || (e[t] = [])).push(n)
            },
            off: function (t, n) {
              e[t] && e[t].splice(e[t].indexOf(n) >>> 0, 1)
            },
            emit: function (t, n) {
              ;(e[t] || []).slice().map(function (e) {
                e(n)
              }),
                (e['*'] || []).slice().map(function (e) {
                  e(t, n)
                })
            },
          }),
          n in this
            ? Object.defineProperty(this, n, {
                value: o,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (this[n] = o)
      }
      return (
        (e = [
          {
            key: 'on',
            value: function (e, t) {
              return this.events.on(e, t), this
            },
          },
          {
            key: 'off',
            value: function (e, t) {
              return this.events.off(e, t), this
            },
          },
        ]),
        (function (e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n]
            ;(o.enumerable = o.enumerable || !1),
              (o.configurable = !0),
              'value' in o && (o.writable = !0),
              Object.defineProperty(e, o.key, o)
          }
        })(t.prototype, e),
        t
      )
    })()
  function O(e) {
    if (void 0 === e)
      throw ReferenceError(
        "this hasn't been initialised - super() hasn't been called",
      )
    return e
  }
  function R(e, t, n) {
    return (
      t in e
        ? Object.defineProperty(e, t, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0,
          })
        : (e[t] = n),
      e
    )
  }
  function T(e) {
    return (T = Object.setPrototypeOf
      ? Object.getPrototypeOf
      : function (e) {
          return e.__proto__ || Object.getPrototypeOf(e)
        })(e)
  }
  function w(e, t) {
    return (w =
      Object.setPrototypeOf ||
      function (e, t) {
        return (e.__proto__ = t), e
      })(e, t)
  }
  ;((e = l || (l = {})).MESSAGE = 'message'),
    (e.UNSUPPORTED_MESSAGE = 'unsupported_message')
  var L = 'vk-sak-sdk',
    M = (function (e) {
      !(function (e, t) {
        if ('function' != typeof t && null !== t)
          throw TypeError('Super expression must either be null or a function')
        ;(e.prototype = Object.create(t && t.prototype, {
          constructor: { value: e, writable: !0, configurable: !0 },
        })),
          t && w(e, t)
      })(r, e)
      var t,
        n,
        o =
          ((t = (function () {
            if (
              'undefined' == typeof Reflect ||
              !Reflect.construct ||
              Reflect.construct.sham
            )
              return !1
            if ('function' == typeof Proxy) return !0
            try {
              return (
                Boolean.prototype.valueOf.call(
                  Reflect.construct(Boolean, [], function () {}),
                ),
                !0
              )
            } catch (e) {
              return !1
            }
          })()),
          function () {
            var e,
              n = T(r)
            return (
              (e = t
                ? Reflect.construct(n, arguments, T(this).constructor)
                : n.apply(this, arguments)),
              e &&
              ('object' ==
                (e && 'undefined' != typeof Symbol && e.constructor === Symbol
                  ? 'symbol'
                  : typeof e) ||
                'function' == typeof e)
                ? e
                : O(this)
            )
          })
      function r(e) {
        var t
        return (
          (function (e, t) {
            if (!(e instanceof t))
              throw TypeError('Cannot call a class as a function')
          })(this, r),
          R(O((t = o.call(this))), 'config', void 0),
          (t.config = e),
          (t.handleMessage = t.handleMessage.bind(O(t))),
          window.addEventListener('message', t.handleMessage),
          t
        )
      }
      return (
        (n = [
          {
            key: 'destroy',
            value: function () {
              delete this.config,
                window.removeEventListener('message', this.handleMessage)
            },
          },
          {
            key: 'sendMessage',
            value: function (e) {
              var t
              null === (t = this.config.iframe.contentWindow) ||
                void 0 === t ||
                t.postMessage(
                  (function (e) {
                    for (var t = 1; t < arguments.length; t++) {
                      var n = null != arguments[t] ? arguments[t] : {},
                        o = Object.keys(n)
                      'function' == typeof Object.getOwnPropertySymbols &&
                        (o = o.concat(
                          Object.getOwnPropertySymbols(n).filter(function (e) {
                            return Object.getOwnPropertyDescriptor(
                              n,
                              e,
                            ).enumerable
                          }),
                        )),
                        o.forEach(function (t) {
                          R(e, t, n[t])
                        })
                    }
                    return e
                  })({ type: L }, e),
                  this.config.origin,
                )
            },
          },
          {
            key: 'handleMessage',
            value: function (e) {
              var t
              if (
                !this.config.origin ||
                e.origin !== this.config.origin ||
                e.source !== this.config.iframe.contentWindow ||
                (null === (t = e.data) || void 0 === t ? void 0 : t.type) !== L
              ) {
                this.events.emit(l.UNSUPPORTED_MESSAGE, e.data)
                return
              }
              this.events.emit(l.MESSAGE, e.data)
            },
          },
        ]),
        (function (e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n]
            ;(o.enumerable = o.enumerable || !1),
              (o.configurable = !0),
              'value' in o && (o.writable = !0),
              Object.defineProperty(e, o.key, o)
          }
        })(r.prototype, n),
        r
      )
    })(S)
  function k(e, t, n) {
    return (
      t in e
        ? Object.defineProperty(e, t, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0,
          })
        : (e[t] = n),
      e
    )
  }
  var A = (function () {
    var e
    function t() {
      ;(function (e, t) {
        if (!(e instanceof t))
          throw TypeError('Cannot call a class as a function')
      })(this, t),
        k(this, 'store', {})
    }
    return (
      (e = [
        {
          key: 'init',
          value: function (e) {
            return this.set(e), this
          },
        },
        {
          key: 'update',
          value: function (e) {
            return this.set(e)
          },
        },
        {
          key: 'set',
          value: function (e) {
            return (
              (this.store = (function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = null != arguments[t] ? arguments[t] : {},
                    o = Object.keys(n)
                  'function' == typeof Object.getOwnPropertySymbols &&
                    (o = o.concat(
                      Object.getOwnPropertySymbols(n).filter(function (e) {
                        return Object.getOwnPropertyDescriptor(n, e).enumerable
                      }),
                    )),
                    o.forEach(function (t) {
                      k(e, t, n[t])
                    })
                }
                return e
              })({}, this.store, e)),
              this
            )
          },
        },
        {
          key: 'get',
          value: function () {
            return this.store
          },
        },
      ]),
      (function (e, t) {
        for (var n = 0; n < t.length; n++) {
          var o = t[n]
          ;(o.enumerable = o.enumerable || !1),
            (o.configurable = !0),
            'value' in o && (o.writable = !0),
            Object.defineProperty(e, o.key, o)
        }
      })(t.prototype, e),
      t
    )
  })()
  ;((t = h || (h = {})).RUS = '0'),
    (t.UKR = '1'),
    (t.ENG = '3'),
    (t.SPA = '4'),
    (t.GERMAN = '6'),
    (t.POL = '15'),
    (t.FRA = '16'),
    (t.UZB = '65'),
    (t.TURKEY = '82'),
    (t.KAZ = '97'),
    (t.BEL = '114'),
    ((n = f || (f = {})).LIGHT = 'light'),
    (n.DARK = 'dark'),
    ((o = d || (d = {})).POPUP = 'popup'),
    (o.BLOCK = 'block'),
    ((r = v || (v = {})).CURSOR = 'cursor'),
    (r.TAPS = 'taps')
  var P = (
    (e, t = 21) =>
    (n = t) => {
      let o = '',
        r = n
      for (; r--; ) o += e[(Math.random() * e.length) | 0]
      return o
    }
  )('qazwsxedcrfvtgbyhnujmikol', 6)
  function _(e, t, n) {
    return (
      t in e
        ? Object.defineProperty(e, t, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0,
          })
        : (e[t] = n),
      e
    )
  }
  ;((i = m || (m = {})).LOADING = 'loading'),
    (i.LOADED = 'loaded'),
    (i.NOT_LOADED = 'not_loaded'),
    ((a = p || (p = {}))[(a.TimeoutExceeded = 0)] = 'TimeoutExceeded'),
    (a[(a.InternalError = 1)] = 'InternalError'),
    (a[(a.AuthError = 2)] = 'AuthError'),
    ((s = y || (y = {})).INIT = 'init'),
    (s.MOUSE_CHANGE = 'mouseChange'),
    (s.TOUCH_CHANGE = 'touchChange')
  var C =
    (_((g = {}), p.TimeoutExceeded, 'timeout'),
    _(g, p.InternalError, 'internal error'),
    _(g, p.AuthError, 'auth error'),
    g)
  ;((c = b || (b = {})).START_LOAD = 'common: start load'),
    (c.LOAD = 'common: load'),
    (c.SHOW = 'common: show'),
    (c.HIDE = 'common: hide'),
    (c.CLOSE = 'common: close'),
    (c.ERROR = 'common: error'),
    (c.RESIZE = 'common: resize'),
    ((u = E || (E = {})).GET_RESULT = 'VKCaptchaGetResult'),
    (u.CLOSE = 'VKCaptchaCloseCaptcha'),
    (u.SENSORS_START = 'VKCaptchaListenSensorsStart'),
    (u.SEND_SENSORS = 'VKCaptchaListenSensorsChanged'),
    (u.SEND_WEB_SENSORS = 'VKCaptchaListenSensorsWebChanged'),
    (u.SENSORS_STOP = 'VKCaptchaListenSensorsStop'),
    (u.USER_CLOSE = 'VKCaptchaUserClose')
  var j = function (e, t) {
    return '\n<div id="'
      .concat(e, '" data-test-id="captcha-widget">\n  <style>\n    #')
      .concat(e, ' {')
      .concat(
        t === d.POPUP
          ? '\n      position: fixed;\n      top: 0;\n      left: 0;\n      z-index: 1500;'
          : '',
        '\n      width: 100%;\n      height: 100%;\n      max-width: 100%;\n      max-height: 100%;\n    }\n\n    #',
      )
      .concat(
        e,
        ' iframe {\n      border: none;\n      color-scheme: auto;\n    }\n\n    #',
      )
      .concat(e, ' .loader,\n    #')
      .concat(
        e,
        ' .error {\n      display: none;\n      width: 100%;\n      height: 100%;\n      text-align: center;\n    }\n  </style>\n  <div class="loader"></div>\n  <div class="error"></div>\n  <iframe width="100%" height="100%"></iframe>\n</div>\n  ',
      )
  }
  function D(e) {
    if (void 0 === e)
      throw ReferenceError(
        "this hasn't been initialised - super() hasn't been called",
      )
    return e
  }
  function N(e, t, n) {
    return (
      t in e
        ? Object.defineProperty(e, t, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0,
          })
        : (e[t] = n),
      e
    )
  }
  function U(e) {
    return (U = Object.setPrototypeOf
      ? Object.getPrototypeOf
      : function (e) {
          return e.__proto__ || Object.getPrototypeOf(e)
        })(e)
  }
  function I(e, t) {
    return (I =
      Object.setPrototypeOf ||
      function (e, t) {
        return (e.__proto__ = t), e
      })(e, t)
  }
  var x = (function (e) {
    !(function (e, t) {
      if ('function' != typeof t && null !== t)
        throw TypeError('Super expression must either be null or a function')
      ;(e.prototype = Object.create(t && t.prototype, {
        constructor: { value: e, writable: !0, configurable: !0 },
      })),
        t && I(e, t)
    })(r, e)
    var t,
      n,
      o =
        ((t = (function () {
          if (
            'undefined' == typeof Reflect ||
            !Reflect.construct ||
            Reflect.construct.sham
          )
            return !1
          if ('function' == typeof Proxy) return !0
          try {
            return (
              Boolean.prototype.valueOf.call(
                Reflect.construct(Boolean, [], function () {}),
              ),
              !0
            )
          } catch (e) {
            return !1
          }
        })()),
        function () {
          var e,
            n = U(r)
          return (
            (e = t
              ? Reflect.construct(n, arguments, U(this).constructor)
              : n.apply(this, arguments)),
            e &&
            ('object' ==
              (e && 'undefined' != typeof Symbol && e.constructor === Symbol
                ? 'symbol'
                : typeof e) ||
              'function' == typeof e)
              ? e
              : D(this)
          )
        })
    function r() {
      var e,
        t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
      return (
        (function (e, t) {
          if (!(e instanceof t))
            throw TypeError('Cannot call a class as a function')
        })(this, r),
        N(D((e = o.call(this))), 'id', P()),
        N(D(e), 'scheme', void 0),
        N(D(e), 'lang', void 0),
        N(D(e), 'config', void 0),
        N(D(e), 'timeoutTimer', void 0),
        N(D(e), 'bridge', void 0),
        N(D(e), 'container', void 0),
        N(D(e), 'iframeSrc', void 0),
        N(D(e), 'view', void 0),
        N(D(e), 'onClose', void 0),
        N(D(e), 'templateRenderer', j),
        N(D(e), 'promise', void 0),
        N(D(e), 'promiseResolve', void 0),
        N(D(e), 'promiseReject', void 0),
        N(D(e), 'elements', void 0),
        N(D(e), 'getIframeCoords', function () {
          var t = e.elements.iframe.getBoundingClientRect(),
            n = t.left,
            o = t.top
          return { left: n + window.scrollX, top: o + window.scrollY }
        }),
        N(D(e), 'sendSensorsData', function (t) {
          var n = t.eventType,
            o = t.data
          e.bridge.sendMessage({
            handler: E.SEND_WEB_SENSORS,
            params: { eventType: n, data: o, coords: e.getIframeCoords() },
          })
        }),
        N(D(e), 'handleMouseMove', function (t) {
          var n = t.pageX,
            o = t.pageY
          e.sendSensorsData({
            eventType: y.MOUSE_CHANGE,
            data: { pageX: n, pageY: o },
          })
        }),
        N(D(e), 'handleTouchMove', function (t) {
          var n = t.touches[0]
          if (n) {
            var o = n.pageX,
              r = n.pageY
            e.sendSensorsData({
              eventType: y.TOUCH_CHANGE,
              data: { pageX: o, pageY: r },
            })
          }
        }),
        (e.config = new A().init(t)),
        e
      )
    }
    return (
      (n = [
        {
          key: 'update',
          value: function (e) {
            return this.config.update(e)
          },
        },
        {
          key: 'show',
          value: function (e) {
            var t = this,
              n = e.container,
              o = e.iframeSrc,
              r = e.view,
              i = e.scheme,
              a = e.lang,
              s = e.onClose
            return (
              (this.promise = new Promise(function (e, n) {
                ;(t.promiseResolve = e), (t.promiseReject = n)
              })),
              (this.container = n),
              (this.iframeSrc = o),
              (this.view = r),
              (this.iframeSrc = o),
              (this.scheme = i),
              (this.lang = a),
              (this.onClose = s),
              this.renderTemplate(),
              this.registerElements(),
              this.loadWidgetFrame(),
              this.promise
            )
          },
        },
        {
          key: 'close',
          value: function () {
            var e, t, n, o, r
            clearTimeout(this.timeoutTimer),
              this.removeAnalyticsMouseListeners(),
              this.removeAnalyticsTouchListeners(),
              null === (t = this.elements) ||
                void 0 === t ||
                null === (e = t.root) ||
                void 0 === e ||
                e.remove(),
              null === (n = this.bridge) || void 0 === n || n.destroy(),
              this.events.emit(b.CLOSE),
              null === (o = this.promiseReject) ||
                void 0 === o ||
                o.call(this, 'close'),
              null === (r = this.onClose) || void 0 === r || r.call(this)
          },
        },
        {
          key: 'addAnalyticsMouseListeners',
          value: function () {
            document.addEventListener('mouseenter', this.handleMouseMove),
              document.addEventListener('mouseleave', this.handleMouseMove),
              document.addEventListener('mousemove', this.handleMouseMove)
          },
        },
        {
          key: 'removeAnalyticsMouseListeners',
          value: function () {
            document.removeEventListener('mouseenter', this.handleMouseMove),
              document.removeEventListener('mouseleave', this.handleMouseMove),
              document.removeEventListener('mousemove', this.handleMouseMove)
          },
        },
        {
          key: 'addAnalyticsTouchListeners',
          value: function () {
            document.addEventListener('touchstart', this.handleTouchMove),
              document.addEventListener('touchend', this.handleTouchMove),
              document.addEventListener('touchmove', this.handleTouchMove)
          },
        },
        {
          key: 'removeAnalyticsTouchListeners',
          value: function () {
            document.removeEventListener('touchstart', this.handleTouchMove),
              document.removeEventListener('touchend', this.handleTouchMove),
              document.removeEventListener('touchmove', this.handleTouchMove)
          },
        },
        {
          key: 'onLoadHandler',
          value: function () {
            var e = this
            clearTimeout(this.timeoutTimer),
              setTimeout(function () {
                e.setState(m.LOADED)
              }, 300),
              this.events.emit(b.LOAD)
          },
        },
        {
          key: 'onErrorHandler',
          value: function (e) {
            var t, n, o
            clearTimeout(this.timeoutTimer),
              this.setState(m.NOT_LOADED),
              this.events.emit(b.ERROR, e),
              null === (n = this.elements) ||
                void 0 === n ||
                null === (t = n.iframe) ||
                void 0 === t ||
                t.remove(),
              null === (o = this.promiseReject) ||
                void 0 === o ||
                o.call(this, 'close')
          },
        },
        {
          key: 'onBridgeMessageHandler',
          value: function (e) {
            switch (e.handler) {
              case b.LOAD:
                this.onLoadHandler()
                break
              case E.CLOSE:
              case b.CLOSE:
                this.close()
                break
              case b.ERROR:
                this.onErrorHandler({
                  code: p.InternalError,
                  text: C[p.InternalError],
                  details: e.params,
                })
                break
              case b.RESIZE:
                this.elements.root.style.height = ''.concat(
                  e.params.height,
                  'px',
                )
                break
              case E.GET_RESULT:
                var t = e.params.token
                this.promiseResolve(t)
                break
              case E.SENSORS_START:
                var n = e.params.bridge_sensors_list,
                  o = n.includes(v.CURSOR),
                  r = n.includes(v.TAPS)
                ;(o || r) && this.sendSensorsData({ eventType: y.INIT }),
                  o && this.addAnalyticsMouseListeners(),
                  r && this.addAnalyticsTouchListeners()
                break
              case E.SENSORS_STOP:
                this.removeAnalyticsMouseListeners(),
                  this.removeAnalyticsTouchListeners()
            }
          },
        },
        {
          key: 'renderTemplate',
          value: function () {
            this.container.insertAdjacentHTML(
              'beforeend',
              this.templateRenderer(this.id, this.view),
            )
          },
        },
        {
          key: 'loadWidgetFrame',
          value: function () {
            var e = this,
              t = new URL(this.iframeSrc)
            ;(this.bridge = new M({
              iframe: this.elements.iframe,
              origin: t.origin,
            })),
              this.bridge.on(l.MESSAGE, function (t) {
                return e.onBridgeMessageHandler(t)
              })
            var n = new URLSearchParams(t.search)
            switch (!0) {
              case !!this.scheme:
                n.append('scheme', this.scheme)
              case !!this.lang:
                n.append('lang', this.lang)
              default:
                var o = location.protocol + '//' + location.hostname
                n.append('origin', o), n.append('variant', this.view)
            }
            ;(t = new URL(
              ''.concat(t.origin).concat(t.pathname, '?').concat(n),
            )),
              (this.elements.iframe.src = t.href)
          },
        },
        {
          key: 'setState',
          value: function (e) {
            this.elements.root.setAttribute('data-state', e)
          },
        },
        {
          key: 'registerElements',
          value: function () {
            var e = document.getElementById(this.id)
            this.elements = { root: e, iframe: e.querySelector('iframe') }
          },
        },
      ]),
      (function (e, t) {
        for (var n = 0; n < t.length; n++) {
          var o = t[n]
          ;(o.enumerable = o.enumerable || !1),
            (o.configurable = !0),
            'value' in o && (o.writable = !0),
            Object.defineProperty(e, o.key, o)
        }
      })(r.prototype, n),
      r
    )
  })(S)
  window._vkidCaptchaWidget = x
}),
  'function' == typeof define && define.amd ? define(e) : e()
