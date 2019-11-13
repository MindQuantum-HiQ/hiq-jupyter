define(["react", "react-dom"], function (e, t) {
	var _reactDom = t;
	return function (e) {
		function t(o) {
			if (r[o])
				return r[o].exports;
			var n = r[o] = {
				exports: {},
				id: o,
				loaded: !1
			};
			return e[o].call(n.exports, n, n.exports, t),
			n.loaded = !0,
			n.exports
		}
		var r = {};
		return t.m = e,
		t.c = r,
		t.p = "",
		t(0)
	}
	([function (e, t, r) {
				"use strict";
				function o(e) {
					return e && e.__esModule ? e : {
						"default": e
					}
				}
				function n(e, t) {
					e.react_output || (e.react_output = {}),
					e.react_output[t] || (e.react_output[t] = new p(e)),
					e.clear_output = function () {
						Object.getPrototypeOf(e).clear_output.call(e),
						e.react_output[t].clear()
					}
				}
				function a(e, t, r, o) {
					requirejs(["services/kernels/comm"], function (a) {
						var u = function (e, t) {
							t.comm_manager.register_target(r, function (t, a) {
								t.on_close((m) => console.log('CLOZED') || console.log(m));
								if ("comm_open" === a.msg_type) {
									console.log("comm_open");
									var u = a.parent_header.msg_id,
									s = e.notebook.get_msg_cell(u),
									p = i["default"].createElement(f, c({}, o, {
												comm: t,
												comm_msg: a
											}));
									o.element ? l["default"].render(p, o.element) : (n(s, r), s.react_output && s.react_output[r] && l["default"].render(p, s.react_output[r].subarea))
								}
							}),
							t.comm_info(r, function (u) {
//								console.log('u.content.comms', u.content.comms);
								var s = Object.keys(u.content.comms),
								p = e.notebook.metadata;
								console.log(u.content.comms, s)
								s.length && p.react_comms && s.filter(function (e) {
									console.log(e, e.comm_id, p.react_comms);
									return p.react_comms[e.comm_id] && e
								}).forEach(function (u) {
									var s = e.notebook.get_cells()[parseInt(p.react_comms[u])];
									if (s) {
										var d = u.split(".").slice(-1)[0],
										m = new a.Comm(r, u);
										t.comm_manager.register_comm(m),
										n(s, r);
										var _ = i["default"].createElement(f, c({}, o, {
													comm: m,
													comm_msg: {
														content: {
															data: {
																module: d
															}
														}
													}
												}));
										l["default"].render(_, s.react_output[r].subarea)
									}
								})
							})
						};
						e.notebook && e.notebook.kernel && u(e, e.notebook.kernel),
						t.on("kernel_created.Kernel kernel_created.Session", function (t, r) {
							u(e, r.kernel)
						}),
						t.on("delete.Cell", function (e, t) {
							t.cell && t.cell.react_output && t.cell.react_output[r].clear()
						})
					})
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var c = Object.assign || function (e) {
					for (var t = 1; t < arguments.length; t++) {
						var r = arguments[t];
						for (var o in r)
							Object.prototype.hasOwnProperty.call(r, o) && (e[o] = r[o])
					}
					return e
				},
				u = r(1),
				i = o(u),
				s = r(5),
				l = o(s),
				p = r(4),
				f = r(3);
				t["default"] = {
					init: a
				},
				e.exports = t["default"]
			}, function (t, r) {
				t.exports = e
			}, function (e, t) {
				"use strict";
				function r() {
					for (var e = arguments.length, t = Array(e), r = 0; r < e; r++)
						t[r] = arguments[r];
					return 1 === t.length ? o.apply(void 0, t) : n.apply(void 0, t)
				}
				function o(e) {
					var t = void 0;
					return "undefined" != typeof Reflect && "function" == typeof Reflect.ownKeys ? t = Reflect.ownKeys(e.prototype) : (t = Object.getOwnPropertyNames(e.prototype), "function" == typeof Object.getOwnPropertySymbols && (t = t.concat(Object.getOwnPropertySymbols(e.prototype)))),
					t.forEach(function (t) {
						if ("constructor" !== t) {
							var r = Object.getOwnPropertyDescriptor(e.prototype, t);
							"function" == typeof r.value && Object.defineProperty(e.prototype, t, n(e, t, r))
						}
					}),
					e
				}
				function n(e, t, r) {
					var o = r.value;
					if ("function" != typeof o)
						throw new Error("@autobind decorator can only be applied to methods not: " + typeof o);
					var n = !1;
					return {
						configurable: !0,
						get: function () {
							if (n || this === e.prototype || this.hasOwnProperty(t))
								return o;
							var r = o.bind(this);
							return n = !0,
							Object.defineProperty(this, t, {
								value: r,
								configurable: !0,
								writable: !0
							}),
							n = !1,
							r
						}
					}
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				}),
				t["default"] = r,
				e.exports = t["default"]
			}, function (e, t, r) {
				"use strict";
				function o(e) {
					return e && e.__esModule ? e : {
						"default": e
					}
				}
				function n(e, t) {
					if (!(e instanceof t))
						throw new TypeError("Cannot call a class as a function")
				}
				function a(e, t) {
					if (!e)
						throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
					return !t || "object" != typeof t && "function" != typeof t ? e : t
				}
				function c(e, t) {
					if ("function" != typeof t && null !== t)
						throw new TypeError("Super expression must either be null or a function, not " + typeof t);
					e.prototype = Object.create(t && t.prototype, {
							constructor: {
								value: e,
								enumerable: !1,
								writable: !0,
								configurable: !0
							}
						}),
					t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var u,
				i = Object.assign || function (e) {
					for (var t = 1; t < arguments.length; t++) {
						var r = arguments[t];
						for (var o in r)
							Object.prototype.hasOwnProperty.call(r, o) && (e[o] = r[o])
					}
					return e
				},
				s = function () {
					function e(e, t) {
						for (var r = 0; r < t.length; r++) {
							var o = t[r];
							o.enumerable = o.enumerable || !1,
							o.configurable = !0,
							"value" in o && (o.writable = !0),
							Object.defineProperty(e, o.key, o)
						}
					}
					return function (t, r, o) {
						return r && e(t.prototype, r),
						o && e(t, o),
						t
					}
				}
				(),
				l = r(1),
				p = o(l),
				f = r(2),
				d = o(f),
				b = (0, d["default"])(u = function (e) {
					function t(e) {
						n(this, t);
						var r = a(this, Object.getPrototypeOf(t).call(this, e));
						return r.state = {
							renderProps: null
						},
						e.comm.on_msg(r.handleMsg),
						r
					}
					return c(t, e),
					s(t, [{
								key: "handleMsg",
								value: function (e) {
									var t = this,
									r = this.props,
									o = r.comm_msg,
									n = r.save,
									a = e.content.data,
									c = a.method,
									u = a.props,
									s = void 0 === u ? {}
									 : u;
									if ("update" === c) {
										if (this.props.on_update)
											return this.props.on_update(o.content.data.module, s, e.content.comm_id);
										this.setState({
											renderProps: i({}, s, o.content.data)
										})
									} else
										"display" === c && (n ? this._save(e, function () {
												t.setState({
													renderProps: i({}, s, o.content.data)
												})
											}) : this.setState({
												renderProps: i({}, s, o.content.data)
											}))
								}
							}, {
								key: "_save",
								value: function (e, t) {
									var r = this._getMsgCell(e),
									o = Jupyter.notebook.metadata;
									r && (o.react_comms || (o.react_comms = {}), o.react_comms[comm.comm_id] = this._getCellIndex(r.cell_id) + ""),
									t()
								}
							}, {
								key: "render",
								value: function () {
									var e = this.state.renderProps,
									t = this.props,
									r = t.comm_msg,
									o = t.comm,
									n = t.components;
									return p["default"].createElement("div", null, e && r && p["default"].createElement(n[r.content.data.module], i({
												comm: o
											}, e)))
								}
							}
						]),
					t
				}
					(p["default"].Component)) || u;
				t["default"] = b,
				e.exports = t["default"]
			}, function (e, t) {
				"use strict";
				function r(e) {
					var t = this;
					this.clear = function () {
						//t.subarea.innerHTML = ""
						_reactDom.unmountComponentAtNode(t.subarea);
					};
					var r = document.createElement("div");
					r.classList.add("jupyter-react-area"),
					r.classList.add("widget-area"),
					this.area = r;
					var o = document.createElement("div");
					o.classList.add("prompt"),
					r.appendChild(o);
					var n = document.createElement("div");
					return n.classList.add("jupyter-react-subarea"),
					n.classList.add("widget-subarea"),
					r.appendChild(n),
					this.subarea = n,
					e.input && e.input.after(r),
					this
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				}),
				t["default"] = r,
				e.exports = t["default"]
			}, function (e, r) {
				e.exports = t
			}
		])
});
