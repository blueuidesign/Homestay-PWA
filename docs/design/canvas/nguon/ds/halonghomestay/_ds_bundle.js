/* @ds-bundle: {"format":4,"namespace":"HalongHomestayDesignSystem_407c75","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"IconButton","sourcePath":"components/actions/IconButton.jsx"},{"name":"CalendarCell","sourcePath":"components/calendar/CalendarCell.jsx"},{"name":"RoomCard","sourcePath":"components/calendar/RoomCard.jsx"},{"name":"ROOMS","sourcePath":"components/format.js"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"ICON_NAMES","sourcePath":"components/icons/Icon.jsx"},{"name":"Icon","sourcePath":"components/icons/Icon.jsx"},{"name":"TabBar","sourcePath":"components/navigation/TabBar.jsx"},{"name":"BottomSheet","sourcePath":"components/overlays/BottomSheet.jsx"},{"name":"FilterChip","sourcePath":"components/selection/FilterChip.jsx"},{"name":"MonthBars","sourcePath":"components/statistics/MonthBars.jsx"},{"name":"StatCard","sourcePath":"components/statistics/StatCard.jsx"},{"name":"Badge","sourcePath":"components/status/Badge.jsx"},{"name":"Banner","sourcePath":"components/status/Banner.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"39c8b82a6af2","components/actions/IconButton.jsx":"3e62d6e2dc7a","components/calendar/CalendarCell.jsx":"81585b26d327","components/calendar/RoomCard.jsx":"3552699aba6c","components/format.js":"836a840fd3f4","components/forms/Checkbox.jsx":"c9f91afc2461","components/forms/TextField.jsx":"5327dc19d89a","components/icons/Icon.jsx":"7784f7ff2e93","components/navigation/TabBar.jsx":"24f0d1b26a2b","components/overlays/BottomSheet.jsx":"e3dfddf3555c","components/selection/FilterChip.jsx":"6e46508f86b6","components/statistics/MonthBars.jsx":"568c7e5f5fcf","components/statistics/StatCard.jsx":"2df669cf090f","components/status/Badge.jsx":"2690e278d736","components/status/Banner.jsx":"f1b16b2c9b25","ui_kits/app/AppHeader.jsx":"b2750005482f","ui_kits/app/BookingSheet.jsx":"84378101dcab","ui_kits/app/CalendarScreen.jsx":"e439ec3630f5","ui_kits/app/SaleScreen.jsx":"ade18e48c197","ui_kits/app/StatsScreen.jsx":"a76e00cfe6a0","ui_kits/app/data.js":"b853e2ad41ec"},"inlinedExternals":[],"unexposedExports":[{"name":"formatDate","sourcePath":"components/format.js"},{"name":"formatMillions","sourcePath":"components/format.js"},{"name":"formatVnd","sourcePath":"components/format.js"},{"name":"nights","sourcePath":"components/format.js"},{"name":"pad","sourcePath":"components/format.js"}]} */

(() => {

const __ds_ns = (window.HalongHomestayDesignSystem_407c75 = window.HalongHomestayDesignSystem_407c75 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/format.js
try { (() => {
// Thứ tự phòng cố định: quyết định thứ tự làn trên ô lịch và thứ tự thẻ.
const ROOMS = ['1509', '3402'];
function pad(n) {
  return String(n).padStart(2, '0');
}
/** 2500000 → "2.500.000đ" */
function formatVnd(n) {
  return (Number(n) || 0).toLocaleString('vi-VN') + 'đ';
}
/** 82650000 → "82.7tr" */
function formatMillions(n) {
  const v = (Number(n) || 0) / 1e6;
  return v > 0 ? v.toFixed(1) + 'tr' : '';
}
/** "2026-07-14" → "14/07" hoặc "14/07/2026" */
function formatDate(iso, full) {
  if (!iso) return '';
  const p = String(iso).split('-');
  return full ? p[2] + '/' + p[1] + '/' + p[0] : p[2] + '/' + p[1];
}
function nights(a, b) {
  const pa = String(a).split('-').map(Number),
    pb = String(b).split('-').map(Number);
  return Math.round((new Date(pb[0], pb[1] - 1, pb[2]) - new Date(pa[0], pa[1] - 1, pa[2])) / 86400000);
}
Object.assign(__ds_scope, { ROOMS, pad, formatVnd, formatMillions, formatDate, nights });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/format.js", error: String((e && e.message) || e) }); }

// components/calendar/CalendarCell.jsx
try { (() => {
const cx = (...a) => a.filter(Boolean).join(' ');
function CalendarCell({
  day,
  booked = [],
  rooms,
  today,
  selected,
  onClick
}) {
  const lanes = rooms || __ds_scope.ROOMS;
  const label = 'Ngày ' + day + (booked.length ? ', đã đặt phòng ' + booked.join(', ') : ', trống');
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    "aria-label": label,
    "aria-pressed": !!selected,
    className: cx('hh-cell', today && 'hh-cell--today', selected && 'hh-cell--selected')
  }, /*#__PURE__*/React.createElement("span", {
    className: "hh-cell__day"
  }, day), /*#__PURE__*/React.createElement("span", {
    className: "hh-cell__bars",
    "aria-hidden": "true"
  }, lanes.map(r => /*#__PURE__*/React.createElement("span", {
    key: r,
    className: cx('hh-cell__bar', booked.indexOf(r) !== -1 ? 'hh-bar--r' + r : 'hh-bar--empty')
  }))));
}
Object.assign(__ds_scope, { CalendarCell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/calendar/CalendarCell.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(' ');
function TextField({
  label,
  hint,
  multiline,
  rows,
  className,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: cx('hh-field', className)
  }, label ? /*#__PURE__*/React.createElement("span", {
    className: "hh-field__label"
  }, label) : null, multiline ? /*#__PURE__*/React.createElement("textarea", _extends({}, rest, {
    className: "hh-input",
    rows: rows || 2
  })) : /*#__PURE__*/React.createElement("input", _extends({
    type: "text"
  }, rest, {
    className: "hh-input"
  })), hint ? /*#__PURE__*/React.createElement("span", {
    className: "hh-field__hint"
  }, hint) : null);
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/icons/Icon.jsx
try { (() => {
const cx = (...a) => a.filter(Boolean).join(' ');
// Bản nhỏ của Lucide (nét 2px, đầu tròn) — đúng các path app gốc dùng.
const PATHS = {
  x: ['M18 6 6 18', 'm6 6 12 12'],
  check: ['M20 6 9 17l-5-5'],
  plus: ['M5 12h14', 'M12 5v14'],
  'chevron-left': ['m15 18-6-6 6-6'],
  'chevron-right': ['m9 18 6-6-6-6'],
  pencil: ['M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'],
  trash: ['M3 6h18', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'],
  refresh: ['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M8 16H3v5'],
  'log-out': ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'm16 17 5-5-5-5', 'M21 12H9'],
  calendar: [{
    t: 'rect',
    a: {
      x: 3,
      y: 4,
      width: 18,
      height: 18,
      rx: 2
    }
  }, 'M16 2v4', 'M8 2v4', 'M3 10h18'],
  chart: ['M3 3v18h18', 'M18 17V9', 'M13 17V5', 'M8 17v-3'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', {
    t: 'circle',
    a: {
      cx: 9,
      cy: 7,
      r: 4
    }
  }, 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', {
    t: 'circle',
    a: {
      cx: 12,
      cy: 7,
      r: 4
    }
  }],
  phone: ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'],
  wallet: ['M21 12V7H5a2 2 0 0 1 0-4h14v4', 'M3 5v14a2 2 0 0 0 2 2h16v-5', 'M18 12a2 2 0 0 0 0 4h4v-4Z'],
  note: ['M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z', 'M15 3v6h6'],
  alert: ['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01']
};
const ICON_NAMES = Object.keys(PATHS);
function Icon({
  name,
  size = 16,
  label,
  className
}) {
  const parts = PATHS[name] || [];
  return /*#__PURE__*/React.createElement("svg", {
    className: cx('hh-icon', className),
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    role: label ? 'img' : undefined,
    "aria-label": label || undefined,
    "aria-hidden": label ? undefined : true
  }, parts.map((s, i) => typeof s === 'string' ? /*#__PURE__*/React.createElement("path", {
    key: i,
    d: s
  }) : React.createElement(s.t, {
    key: i,
    ...s.a
  })));
}
Object.assign(__ds_scope, { ICON_NAMES, Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icons/Icon.jsx", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(' ');
function Button({
  variant = 'primary',
  shape,
  icon,
  children,
  className,
  ...rest
}) {
  const s = shape || (variant === 'text' ? 'inline' : 'block');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button"
  }, rest, {
    className: cx('hh-btn', 'hh-btn--' + variant, 'hh-btn--' + s, className)
  }), icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16
  }) : null, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(' ');
function IconButton({
  icon,
  label,
  tone,
  round,
  spinning,
  className,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label
  }, rest, {
    className: cx('hh-iconbtn', tone === 'danger' && 'hh-iconbtn--danger', round && 'hh-iconbtn--round', className)
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16,
    className: spinning ? 'hh-spin' : null
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/calendar/RoomCard.jsx
try { (() => {
const cx = (...a) => a.filter(Boolean).join(' ');
function RoomCard({
  room,
  booking,
  role = 'owner',
  onEdit,
  onDelete,
  onAdd
}) {
  const [confirming, setConfirming] = React.useState(false);
  const b = booking;
  const isOwner = role === 'owner';
  return /*#__PURE__*/React.createElement("div", {
    className: cx('hh-room', b && 'hh-room--r' + room)
  }, /*#__PURE__*/React.createElement("div", {
    className: "hh-room__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hh-room__title"
  }, 'Phòng ' + room, !b ? /*#__PURE__*/React.createElement("span", {
    className: "hh-room__free"
  }, " \xB7 Tr\u1ED1ng \u2713") : null, b && !isOwner ? /*#__PURE__*/React.createElement("span", {
    className: "hh-room__booked"
  }, ' · Đã đặt (' + __ds_scope.formatDate(b.checkIn) + ' → ' + __ds_scope.formatDate(b.checkOut) + ')') : null), isOwner ? b ? /*#__PURE__*/React.createElement("div", {
    className: "hh-room__actions"
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "pencil",
    label: "S\u1EEDa \u0111\u1EB7t ph\xF2ng",
    onClick: onEdit
  }), confirming ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "hh-confirm",
    onClick: () => {
      setConfirming(false);
      onDelete && onDelete();
    }
  }, "X\xE1c nh\u1EADn x\xF3a?") : /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "trash",
    label: "X\xF3a \u0111\u1EB7t ph\xF2ng",
    tone: "danger",
    onClick: () => setConfirming(true)
  })) : /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "text",
    icon: "plus",
    onClick: onAdd
  }, "Th\xEAm kh\xE1ch") : null), b && isOwner ? /*#__PURE__*/React.createElement("div", {
    className: "hh-room__rows"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hh-room__row"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "user",
    size: 14
  }), /*#__PURE__*/React.createElement("span", {
    className: "hh-room__guest"
  }, b.guestName)), b.phone ? /*#__PURE__*/React.createElement("div", {
    className: "hh-room__row"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "phone",
    size: 14
  }), /*#__PURE__*/React.createElement("a", {
    className: "hh-link",
    href: 'tel:' + b.phone
  }, b.phone)) : null, /*#__PURE__*/React.createElement("div", {
    className: "hh-room__row"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "calendar",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, __ds_scope.formatDate(b.checkIn) + ' → ' + __ds_scope.formatDate(b.checkOut) + ' (' + __ds_scope.nights(b.checkIn, b.checkOut) + ' đêm)')), /*#__PURE__*/React.createElement("div", {
    className: "hh-room__row"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "wallet",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, __ds_scope.formatVnd(b.price) + (b.deposit ? ' · Cọc: ' + __ds_scope.formatVnd(b.deposit) : ''))), b.notes ? /*#__PURE__*/React.createElement("div", {
    className: "hh-room__row"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "note",
    size: 14
  }), /*#__PURE__*/React.createElement("span", {
    className: "hh-room__note"
  }, b.notes)) : null) : null);
}
Object.assign(__ds_scope, { RoomCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/calendar/RoomCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
const cx = (...a) => a.filter(Boolean).join(' ');
function Checkbox({
  checked,
  onChange,
  children
}) {
  const on = !!checked;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "checkbox",
    "aria-checked": on,
    onClick: () => onChange && onChange(!on),
    className: cx('hh-check', on && 'hh-check--on')
  }, /*#__PURE__*/React.createElement("span", {
    className: "hh-check__box",
    "aria-hidden": "true"
  }, on ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 13
  }) : null), /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TabBar.jsx
try { (() => {
const cx = (...a) => a.filter(Boolean).join(' ');
function TabBar({
  tabs = [],
  active,
  onChange,
  fixed
}) {
  return /*#__PURE__*/React.createElement("nav", {
    className: cx('hh-tabbar', fixed && 'hh-tabbar--fixed')
  }, tabs.map(t => {
    const on = t.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      type: "button",
      "aria-current": on ? 'page' : undefined,
      className: cx('hh-tab', on && 'hh-tab--on'),
      onClick: () => onChange && onChange(t.id)
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: t.icon,
      size: 22
    }), t.label);
  }));
}
Object.assign(__ds_scope, { TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TabBar.jsx", error: String((e && e.message) || e) }); }

// components/overlays/BottomSheet.jsx
try { (() => {
const cx = (...a) => a.filter(Boolean).join(' ');
function BottomSheet({
  title,
  open,
  onClose,
  contained,
  children
}) {
  if (open === false) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: cx('hh-scrim', contained && 'hh-scrim--contained'),
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "hh-sheet",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title,
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "hh-sheet__head"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "hh-sheet__title"
  }, title), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    label: "\u0110\xF3ng",
    className: "hh-sheet__close",
    onClick: onClose
  })), /*#__PURE__*/React.createElement("div", {
    className: "hh-sheet__body"
  }, children)));
}
Object.assign(__ds_scope, { BottomSheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/BottomSheet.jsx", error: String((e && e.message) || e) }); }

// components/selection/FilterChip.jsx
try { (() => {
const cx = (...a) => a.filter(Boolean).join(' ');
function FilterChip({
  room,
  kind,
  selected,
  onClick,
  children,
  className
}) {
  const k = room ? 'r' + room : kind || 'neutral';
  const on = !!selected;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-pressed": on,
    onClick: onClick,
    className: cx('hh-chip', 'hh-chip--' + k, on && 'hh-chip--on', className)
  }, room ? /*#__PURE__*/React.createElement("span", {
    className: "hh-chip__dot",
    "aria-hidden": "true"
  }) : null, on && k === 'sale' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 13
  }) : null, children);
}
Object.assign(__ds_scope, { FilterChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/selection/FilterChip.jsx", error: String((e && e.message) || e) }); }

// components/statistics/MonthBars.jsx
try { (() => {
const cx = (...a) => a.filter(Boolean).join(' ');
function MonthBars({
  data = [],
  current,
  label
}) {
  const cur = current == null ? data.length - 1 : current;
  const max = Math.max(...data.map(d => d.value), 1);
  return /*#__PURE__*/React.createElement("div", {
    className: "hh-bars",
    role: "img",
    "aria-label": label || 'Doanh thu theo tháng'
  }, data.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hh-bars__col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hh-bars__val"
  }, __ds_scope.formatMillions(d.value)), /*#__PURE__*/React.createElement("div", {
    className: cx('hh-bars__bar', i === cur && 'hh-bars__bar--current'),
    style: {
      height: Math.max(d.value / max * 100, 2) + '%'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "hh-bars__label"
  }, d.label))));
}
Object.assign(__ds_scope, { MonthBars });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/statistics/MonthBars.jsx", error: String((e && e.message) || e) }); }

// components/statistics/StatCard.jsx
try { (() => {
const cx = (...a) => a.filter(Boolean).join(' ');
function StatCard({
  label,
  value,
  hint,
  tone = 'neutral',
  size = 'md',
  wide
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: cx('hh-stat', 'hh-stat--' + size, 'hh-stat--' + tone, wide && 'hh-stat--wide')
  }, /*#__PURE__*/React.createElement("div", {
    className: "hh-stat__label"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "hh-stat__value"
  }, value), hint ? /*#__PURE__*/React.createElement("div", {
    className: "hh-stat__hint"
  }, hint) : null);
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/statistics/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/status/Badge.jsx
try { (() => {
const cx = (...a) => a.filter(Boolean).join(' ');
function Badge({
  children,
  className
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: cx('hh-badge', className)
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/status/Badge.jsx", error: String((e && e.message) || e) }); }

// components/status/Banner.jsx
try { (() => {
function Banner({
  tone = 'warning',
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: 'hh-banner hh-banner--' + tone,
    role: tone === 'danger' ? 'alert' : 'status'
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "alert",
    size: 16,
    className: "hh-banner__icon"
  }), /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/status/Banner.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/AppHeader.jsx
try { (() => {
function AppHeader({
  role,
  onRefresh,
  refreshing,
  onBook,
  onLogout
}) {
  const {
    Button,
    IconButton
  } = window.HalongHomestayDesignSystem_407c75;
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 10,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '10px var(--space-2)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "title",
    style: {
      flex: 1,
      minWidth: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      color: 'var(--ink)'
    }
  }, "\uD83C\uDFE0 Qu\u1EA3n l\xFD Homestay"), /*#__PURE__*/React.createElement(IconButton, {
    icon: "refresh",
    label: "T\u1EA3i l\u1EA1i",
    round: true,
    spinning: refreshing,
    onClick: onRefresh
  }), role === 'owner' ? /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    shape: "pill",
    icon: "plus",
    onClick: onBook,
    style: {
      padding: '8px 10px'
    }
  }, "\u0110\u1EB7t ph\xF2ng") : null, /*#__PURE__*/React.createElement(IconButton, {
    icon: "log-out",
    label: "\u0110\u0103ng xu\u1EA5t",
    round: true,
    onClick: onLogout
  }));
}
function MonthNav({
  label,
  onPrev,
  onNext
}) {
  const {
    IconButton
  } = window.HalongHomestayDesignSystem_407c75;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-left",
    label: "Th\xE1ng tr\u01B0\u1EDBc",
    onClick: onPrev
  }), /*#__PURE__*/React.createElement("span", {
    className: "nav",
    style: {
      color: 'var(--ink)'
    }
  }, label), /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-right",
    label: "Th\xE1ng sau",
    onClick: onNext
  }));
}
function Card({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      ...style
    }
  }, children);
}
Object.assign(window, {
  AppHeader,
  MonthNav,
  Card
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AppHeader.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/BookingSheet.jsx
try { (() => {
function BookingSheet({
  open,
  initial,
  bookings,
  sales,
  onClose,
  onSave
}) {
  const {
    BottomSheet,
    Checkbox,
    TextField,
    FilterChip,
    Button,
    Banner,
    ROOMS
  } = window.HalongHomestayDesignSystem_407c75;
  const U = window.HH_UTIL;
  const addDay = (iso, n) => {
    const d = new Date(iso);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const [f, setF] = React.useState(null);
  const [err, setErr] = React.useState('');
  React.useEffect(() => {
    if (!open) return;
    const b = initial || {};
    setErr('');
    setF({
      id: b.id,
      room: b.room || '1509',
      one: b.id ? U.nights(b.checkIn, b.checkOut) === 1 : true,
      checkIn: b.checkIn || window.HH_DATA.today,
      checkOut: b.checkOut || addDay(b.checkIn || window.HH_DATA.today, 1),
      guestName: b.guestName || '',
      phone: b.phone || '',
      price: b.price ? b.price.toLocaleString('vi-VN') : '',
      deposit: b.deposit ? b.deposit.toLocaleString('vi-VN') : '',
      notes: b.notes || '',
      saveSale: true
    });
  }, [open, initial]);
  if (!open || !f) return null;
  const set = (k, v) => setF(s => {
    const n = {
      ...s,
      [k]: v
    };
    if (n.one) n.checkOut = addDay(n.checkIn, 1);
    return n;
  });
  const money = v => {
    const d = String(v).replace(/\D/g, '');
    return d ? Number(d).toLocaleString('vi-VN') : '';
  };
  const num = v => Number(String(v).replace(/\D/g, '')) || 0;
  const isNew = f.guestName && !sales.find(s => s.name === f.guestName);
  const save = () => {
    if (!f.guestName.trim()) return setErr('Chưa nhập tên khách hoặc sale');
    if (f.checkOut <= f.checkIn) return setErr('Ngày trả phòng phải sau ngày nhận phòng');
    const clash = bookings.find(b => b.id !== f.id && b.room === f.room && b.checkIn < f.checkOut && f.checkIn < b.checkOut);
    if (clash) return setErr('Trùng lịch phòng ' + f.room + ' với "' + clash.guestName + '" (' + U.dm(clash.checkIn) + ' → ' + U.dm(clash.checkOut) + ')');
    onSave({
      id: f.id,
      room: f.room,
      guestName: f.guestName.trim(),
      phone: f.phone,
      checkIn: f.checkIn,
      checkOut: f.checkOut,
      price: num(f.price),
      deposit: num(f.deposit),
      notes: f.notes
    }, isNew && f.saveSale);
  };
  const roomBtn = r => {
    const on = f.room === r;
    return /*#__PURE__*/React.createElement("button", {
      key: r,
      type: "button",
      onClick: () => set('room', r),
      style: {
        padding: 12,
        borderRadius: 'var(--radius-md)',
        font: 'inherit',
        fontWeight: 600,
        fontSize: 14,
        cursor: 'pointer',
        border: on ? '2px solid transparent' : '2px solid var(--border)',
        background: on ? 'var(--room-' + r + ')' : 'var(--surface)',
        color: on ? 'var(--on-action)' : 'var(--ink-secondary)'
      }
    }, r);
  };
  return /*#__PURE__*/React.createElement(BottomSheet, {
    title: f.id ? 'Sửa đặt phòng' : 'Đặt phòng mới',
    contained: true,
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-2)'
    }
  }, ROOMS.map(roomBtn)), /*#__PURE__*/React.createElement(Checkbox, {
    checked: f.one,
    onChange: v => set('one', v)
  }, "\u1EDE 1 \u0111\xEAm (tr\u1EA3 ph\xF2ng v\xE0o h\xF4m sau)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    label: "Ng\xE0y nh\u1EADn ph\xF2ng",
    type: "date",
    value: f.checkIn,
    onChange: e => set('checkIn', e.target.value)
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "Ng\xE0y tr\u1EA3 ph\xF2ng",
    type: "date",
    value: f.checkOut,
    disabled: f.one,
    onChange: e => set('checkOut', e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-2)'
    }
  }, sales.map(s => /*#__PURE__*/React.createElement(FilterChip, {
    key: s.name,
    kind: "sale",
    selected: f.guestName === s.name,
    onClick: () => setF({
      ...f,
      guestName: s.name,
      phone: s.phone
    })
  }, s.name))), /*#__PURE__*/React.createElement(TextField, {
    label: "Kh\xE1ch / Sale *",
    placeholder: "Ch\u1ECDn \u1EDF tr\xEAn ho\u1EB7c nh\u1EADp t\xEAn m\u1EDBi",
    value: f.guestName,
    onChange: e => set('guestName', e.target.value)
  }), isNew ? /*#__PURE__*/React.createElement(Checkbox, {
    checked: f.saveSale,
    onChange: v => set('saveSale', v)
  }, "L\u01B0u v\xE0o danh s\xE1ch") : null, /*#__PURE__*/React.createElement(TextField, {
    label: "S\u0110T",
    inputMode: "tel",
    placeholder: "0901 234 567",
    value: f.phone,
    onChange: e => set('phone', e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    label: "T\u1ED5ng ti\u1EC1n",
    inputMode: "numeric",
    placeholder: "0",
    value: f.price,
    onChange: e => set('price', money(e.target.value))
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "Ti\u1EC1n c\u1ECDc",
    inputMode: "numeric",
    placeholder: "0",
    value: f.deposit,
    onChange: e => set('deposit', money(e.target.value))
  })), /*#__PURE__*/React.createElement(TextField, {
    label: "Ghi ch\xFA",
    multiline: true,
    value: f.notes,
    onChange: e => set('notes', e.target.value)
  }), err ? /*#__PURE__*/React.createElement(Banner, {
    tone: "danger"
  }, err) : null, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: save
  }, f.id ? 'Lưu thay đổi' : 'Thêm đặt phòng'));
}
Object.assign(window, {
  BookingSheet
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/BookingSheet.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/CalendarScreen.jsx
try { (() => {
function CalendarScreen({
  role,
  bookings,
  month,
  setMonth,
  selected,
  setSelected,
  onAdd,
  onEdit,
  onDelete
}) {
  const {
    CalendarCell,
    RoomCard,
    FilterChip,
    Badge,
    ROOMS
  } = window.HalongHomestayDesignSystem_407c75;
  const U = window.HH_UTIL,
    today = window.HH_DATA.today;
  const [filter, setFilter] = React.useState('all');
  const lanes = filter === 'all' ? ROOMS : [filter];
  const y = 2026,
    m = month;
  const days = new Date(y, m, 0).getDate();
  const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(/*#__PURE__*/React.createElement("div", {
    key: 'e' + i
  }));
  for (let d = 1; d <= days; d++) {
    const iso = U.iso(y, m, d);
    const booked = lanes.filter(r => U.occupied(bookings, r, iso));
    cells.push(/*#__PURE__*/React.createElement(CalendarCell, {
      key: d,
      day: d,
      rooms: lanes,
      booked: booked,
      today: iso === today,
      selected: iso === selected,
      onClick: () => setSelected(iso)
    }));
  }
  const selD = selected.split('-');
  const upcoming = bookings.filter(b => b.checkOut > today).sort((a, b) => a.checkIn.localeCompare(b.checkIn)).slice(0, 5);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 'var(--space-3)',
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(MonthNav, {
    label: 'Tháng ' + m + '/' + y,
    onPrev: () => setMonth(Math.max(1, m - 1)),
    onNext: () => setMonth(Math.min(12, m + 1))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(FilterChip, {
    kind: "neutral",
    selected: filter === 'all',
    onClick: () => setFilter('all')
  }, "C\u1EA3 2 ph\xF2ng"), ROOMS.map(r => /*#__PURE__*/React.createElement(FilterChip, {
    key: r,
    room: r,
    selected: filter === r,
    onClick: () => setFilter(r)
  }, r))), /*#__PURE__*/React.createElement("div", {
    className: "caption",
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      color: 'var(--ink-muted)'
    }
  }, lanes.map(r => /*#__PURE__*/React.createElement("span", {
    key: r,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 6,
      borderRadius: 9999,
      background: 'var(--room-' + r + ')'
    }
  }), r, " \u0111\xE3 \u0111\u1EB7t"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, minmax(0,1fr))',
      gap: 'var(--space-1)'
    }
  }, ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
    className: "label",
    style: {
      textAlign: 'center',
      color: 'var(--ink-muted)'
    }
  }, d)), cells)), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'grid',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "title",
    style: {
      margin: 0,
      color: 'var(--ink)'
    }
  }, 'Ngày ' + selD[2] + '/' + selD[1] + '/' + selD[0]), ROOMS.map(r => {
    const b = U.occupied(bookings, r, selected);
    return /*#__PURE__*/React.createElement(RoomCard, {
      key: r + (b ? b.id : ''),
      room: r,
      role: role,
      booking: b,
      onAdd: () => onAdd(r, selected),
      onEdit: () => onEdit(b),
      onDelete: () => onDelete(b.id)
    });
  })), role === 'owner' ? /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    className: "label",
    style: {
      color: 'var(--ink-muted)',
      marginBottom: 'var(--space-2)'
    }
  }, "\u0110\u1EB7t ph\xF2ng s\u1EAFp t\u1EDBi"), upcoming.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "body",
    style: {
      color: 'var(--ink-faint)',
      margin: 0
    }
  }, "Ch\u01B0a c\xF3 \u0111\u1EB7t ph\xF2ng n\xE0o. B\u1EA5m \"\u0110\u1EB7t ph\xF2ng\" \u0111\u1EC3 th\xEAm kh\xE1ch \u0111\u1EA7u ti\xEAn!") : upcoming.map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: b.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: '10px 0',
      borderTop: i ? '1px solid var(--border-subtle)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 9999,
      background: 'var(--room-' + b.room + ')',
      flex: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "body-strong",
    style: {
      color: 'var(--ink)',
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, b.guestName, b.checkIn <= today ? /*#__PURE__*/React.createElement(Badge, null, "\u0110ang \u1EDF") : null), /*#__PURE__*/React.createElement("div", {
    className: "caption",
    style: {
      color: 'var(--ink-muted)'
    }
  }, 'Phòng ' + b.room + ' · ' + U.dm(b.checkIn) + ' → ' + U.dm(b.checkOut) + ' (' + U.nights(b.checkIn, b.checkOut) + ' đêm)')), /*#__PURE__*/React.createElement("span", {
    className: "body-strong",
    style: {
      color: 'var(--ink)',
      textAlign: 'right'
    }
  }, U.vnd(b.price))))) : null);
}
Object.assign(window, {
  CalendarScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/CalendarScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/SaleScreen.jsx
try { (() => {
function SaleScreen({
  bookings,
  sales
}) {
  const U = window.HH_UTIL;
  const rows = sales.map(s => {
    const bs = bookings.filter(b => b.guestName === s.name && b.checkIn.startsWith('2026-07'));
    return {
      ...s,
      count: bs.length,
      total: bs.reduce((t, b) => t + b.price, 0)
    };
  }).sort((a, b) => b.total - a.total);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    className: "label",
    style: {
      color: 'var(--ink-muted)',
      marginBottom: 'var(--space-2)'
    }
  }, "Sale th\xE1ng 7/2026"), rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: r.name,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: '10px 0',
      borderTop: i ? '1px solid var(--border-subtle)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "body-strong",
    style: {
      color: 'var(--ink)'
    }
  }, r.name), /*#__PURE__*/React.createElement("div", {
    className: "caption",
    style: {
      color: 'var(--ink-muted)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "hh-link",
    href: 'tel:' + r.phone
  }, r.phone), ' · ' + r.count + ' \u0111\u1EB7t ph\xF2ng')), /*#__PURE__*/React.createElement("span", {
    className: "body-strong",
    style: {
      color: 'var(--ink)'
    }
  }, U.vnd(r.total))))));
}
Object.assign(window, {
  SaleScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/SaleScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/StatsScreen.jsx
try { (() => {
function StatsScreen({
  bookings,
  month,
  setMonth
}) {
  const {
    StatCard,
    MonthBars,
    Button
  } = window.HalongHomestayDesignSystem_407c75;
  const U = window.HH_UTIL,
    D = window.HH_DATA;
  const pre = '2026-' + String(month).padStart(2, '0');
  const inMonth = bookings.filter(b => b.checkIn.startsWith(pre));
  const days = new Date(2026, month, 0).getDate();
  const nightsOf = r => {
    let n = 0;
    for (let d = 1; d <= days; d++) if (U.occupied(bookings, r, U.iso(2026, month, d))) n++;
    return n;
  };
  const n1 = nightsOf('1509'),
    n2 = nightsOf('3402');
  const rev = r => inMonth.filter(b => !r || b.room === r).reduce((s, b) => s + b.price, 0);
  const total = rev();
  const pct = Math.round((n1 + n2) / (days * 2) * 100);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(MonthNav, {
    label: 'Tháng ' + month + '/2026',
    onPrev: () => setMonth(Math.max(1, month - 1)),
    onNext: () => setMonth(Math.min(12, month + 1))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    wide: true,
    size: "lg",
    tone: "action",
    label: "Doanh thu th\xE1ng",
    value: U.vnd(total),
    hint: inMonth.length + ' \u0111\u1EB7t ph\xF2ng'
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "L\u1EA5p \u0111\u1EA7y",
    value: pct + '%',
    hint: n1 + n2 + '/' + days * 2 + ' đêm'
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "L\u01B0\u1EE3t kh\xE1ch",
    value: inMonth.length,
    hint: "\u0111\u1EB7t ph\xF2ng trong th\xE1ng"
  }), /*#__PURE__*/React.createElement(StatCard, {
    tone: "1509",
    size: "sm",
    label: "Ph\xF2ng 1509",
    value: U.vnd(rev('1509')),
    hint: n1 + ' đêm'
  }), /*#__PURE__*/React.createElement(StatCard, {
    tone: "3402",
    size: "sm",
    label: "Ph\xF2ng 3402",
    value: U.vnd(rev('3402')),
    hint: n2 + ' đêm'
  })), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    className: "label",
    style: {
      color: 'var(--ink-muted)',
      marginBottom: 'var(--space-3)'
    }
  }, "Doanh thu 6 th\xE1ng"), /*#__PURE__*/React.createElement(MonthBars, {
    data: [...D.pastMonths, {
      label: 'T' + month,
      value: total
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary"
  }, "\uD83D\uDCCA Xu\u1EA5t file Excel (CSV)"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary"
  }, "\uD83D\uDCBE T\u1EA3i file sao l\u01B0u")), /*#__PURE__*/React.createElement("p", {
    className: "caption",
    style: {
      color: 'var(--ink-muted)',
      margin: 0
    }
  }, "\uD83D\uDCA1 T\u1EA3i file sao l\u01B0u m\u1ED7i th\xE1ng m\u1ED9t l\u1EA7n \u0111\u1EC3 gi\u1EEF d\u1EEF li\u1EC7u an to\xE0n."));
}
Object.assign(window, {
  StatsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/StatsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/data.js
try { (() => {
window.HH_DATA = {
  today: '2026-07-14',
  sales: [{
    name: 'Hoàng Nga',
    phone: '0912345678'
  }, {
    name: 'Minh Tuấn',
    phone: '0987654321'
  }, {
    name: 'Lan Anh',
    phone: '0938111222'
  }],
  bookings: [{
    id: 1,
    room: '1509',
    guestName: 'Anh Khoa',
    phone: '0905556677',
    checkIn: '2026-07-08',
    checkOut: '2026-07-09',
    price: 1200000
  }, {
    id: 2,
    room: '1509',
    guestName: 'Hoàng Nga',
    phone: '0912345678',
    checkIn: '2026-07-10',
    checkOut: '2026-07-12',
    price: 2400000,
    deposit: 1000000
  }, {
    id: 3,
    room: '1509',
    guestName: 'Quốc Bảo',
    phone: '0977000111',
    checkIn: '2026-07-12',
    checkOut: '2026-07-13',
    price: 1300000
  }, {
    id: 4,
    room: '1509',
    guestName: 'Thuỷ Trần',
    phone: '0901234567',
    checkIn: '2026-07-14',
    checkOut: '2026-07-16',
    price: 3800000,
    deposit: 1800000,
    notes: '8 sinh viên'
  }, {
    id: 5,
    room: '1509',
    guestName: 'Minh Tuấn',
    phone: '0987654321',
    checkIn: '2026-07-18',
    checkOut: '2026-07-19',
    price: 1200000
  }, {
    id: 6,
    room: '1509',
    guestName: 'Lan Anh',
    phone: '0938111222',
    checkIn: '2026-07-24',
    checkOut: '2026-07-27',
    price: 3600000,
    deposit: 1500000
  }, {
    id: 7,
    room: '3402',
    guestName: 'Chị Hà',
    phone: '0966222333',
    checkIn: '2026-07-02',
    checkOut: '2026-07-04',
    price: 2200000
  }, {
    id: 8,
    room: '3402',
    guestName: 'Minh Tuấn',
    phone: '0987654321',
    checkIn: '2026-07-08',
    checkOut: '2026-07-10',
    price: 2000000,
    deposit: 500000
  }, {
    id: 9,
    room: '3402',
    guestName: 'Hoàng Nga',
    phone: '0912345678',
    checkIn: '2026-07-11',
    checkOut: '2026-07-14',
    price: 3300000,
    deposit: 1000000,
    notes: 'Gia đình 4 người'
  }, {
    id: 10,
    room: '3402',
    guestName: 'Lan Anh',
    phone: '0938111222',
    checkIn: '2026-07-17',
    checkOut: '2026-07-19',
    price: 2100000
  }, {
    id: 11,
    room: '3402',
    guestName: 'Anh Khoa',
    phone: '0905556677',
    checkIn: '2026-07-25',
    checkOut: '2026-07-26',
    price: 1100000
  }],
  pastMonths: [{
    label: 'T2',
    value: 12400000
  }, {
    label: 'T3',
    value: 10800000
  }, {
    label: 'T4',
    value: 15600000
  }, {
    label: 'T5',
    value: 18300000
  }, {
    label: 'T6',
    value: 21900000
  }]
};
window.HH_UTIL = {
  iso: (y, m, d) => y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'),
  occupied: (bs, room, iso) => bs.find(b => b.room === room && b.checkIn <= iso && iso < b.checkOut) || null,
  vnd: n => (Number(n) || 0).toLocaleString('vi-VN') + 'đ',
  dm: iso => {
    const p = iso.split('-');
    return p[2] + '/' + p[1];
  },
  nights: (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000)
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.CalendarCell = __ds_scope.CalendarCell;

__ds_ns.RoomCard = __ds_scope.RoomCard;

__ds_ns.ROOMS = __ds_scope.ROOMS;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.ICON_NAMES = __ds_scope.ICON_NAMES;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.TabBar = __ds_scope.TabBar;

__ds_ns.BottomSheet = __ds_scope.BottomSheet;

__ds_ns.FilterChip = __ds_scope.FilterChip;

__ds_ns.MonthBars = __ds_scope.MonthBars;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Banner = __ds_scope.Banner;

})();
