/* Keeper Maps engine v1.3 (click a picture to close it) — renders a pre-defined floor plan in a Victorian engraved style,
   revealing only what the investigator has explored. Map data: maps/<id>.js (obfuscated).
   Usage:
     <div id="km"></div>
     <script src=".../engine.js"></script><script src=".../maps/<id>.js"></script>
     <script>KeeperMap.render('km', {map:'<id>', explored:[...], glimpsed:[...], found:[...], at:'<room|stairs|item id>'})</script>
*/
(function (root) {
  "use strict";
  var MAPS = {};
  var BASE = (function () { try { var src = document.currentScript && document.currentScript.src; var m = src && src.match(/^(.*?@)[^/]+\/engine\.js/); return m ? m[1] : ""; } catch (e) { return ""; } })();
  var KEY = "keeper";
  function decode(b64) {
    var bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length);
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  function define(id, data) { MAPS[id] = typeof data === "string" ? decode(data) : data; }

  var C = { paper: "#ecdfc0", paper2: "#f1e5c8", panel: "#f3e9d0", ink: "#2b1f12", ink2: "#3b2c1c", ink3: "#5a4630", wash: "#d9c79f", furn: "#e2d2ad", seal: "#8a1c14", glass: "#7b9aa8", gold: "#f2c46a" };
  var STYLE = '.km-hot{cursor:pointer}.km-hot .hl{stroke-opacity:0}.km-hot:hover .hl{stroke:#8a1c14;stroke-width:1.5;stroke-opacity:1;stroke-dasharray:4 3}.km-lbl{opacity:0;pointer-events:none;transition:opacity .15s}.km-hot:hover .km-lbl{opacity:1}.km-lbl rect{fill:#f6eed8;stroke:#3b2c1c;stroke-width:.8}.km-lbl text{font-family:Georgia,serif;font-style:italic;font-size:12px;fill:#2b1f12}' +
    '.km-tabs{display:flex;gap:6px;margin:0 0 8px;flex-wrap:wrap}.km-tabs button{font-family:Georgia,serif;font-size:13px;padding:4px 10px;border:1px solid #b9a882;background:#f3e9d0;color:#2b1f12;border-radius:4px;cursor:pointer}.km-tabs button.on{background:#2b1f12;color:#f3e9d0}' +
    '.km-wrap{position:relative}.km-pv{position:absolute;right:28px;top:84px;width:44%;max-width:300px;background:#f6eed8;border:1px solid #3b2c1c;box-shadow:0 0 0 4px #ecdfc0,0 0 0 5px #3b2c1c;padding:6px 6px 4px;opacity:0;pointer-events:none;transition:opacity .2s;z-index:3}.km-pv.on{opacity:1}.km-pv.on{pointer-events:auto;cursor:pointer}.km-pv img{display:block;width:100%;height:auto;filter:sepia(.15)}.km-pv div{font-family:Georgia,serif;font-style:italic;font-size:12px;color:#2b1f12;text-align:center;margin-top:4px}.km-pv button{position:absolute;top:-10px;right:-10px;width:22px;height:22px;border-radius:50%;border:1px solid #3b2c1c;background:#f3e9d0;color:#2b1f12;font-size:12px;line-height:1;cursor:pointer;display:none;padding:0}.km-pv.pin button{display:block}' +
    '.km-acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.km-acts button{font-size:13px;padding:6px 10px}.km-toast{font-family:Georgia,serif;font-size:13px;color:#5a4630;font-style:italic;min-height:18px;margin-top:6px}';

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }
  function attrJs(s) { return esc(String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'")); }

  /* ---------- furniture glyphs (top-down, ink) ---------- */
  function g(type, x, y, w, h) {
    var s = 'stroke="' + C.ink + '" stroke-width="0.9"', f = 'fill="' + C.furn + '"', o = "";
    var cx = x + w / 2, cy = y + h / 2;
    switch (type) {
      case "bed": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" ' + f + " " + s + "/>";
        o += '<rect x="' + (x + 3) + '" y="' + (y + 3) + '" width="' + (w - 6) + '" height="' + Math.min(14, h * 0.2) + '" fill="' + C.panel + '" ' + s + "/>";
        o += '<path d="M' + (x + 3) + " " + (y + h * 0.45) + " q" + (w / 2 - 3) + " 8 " + (w - 6) + ' 0" fill="none" stroke="' + C.ink3 + '"/>'; break;
      case "table": case "desk": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" ' + f + " " + s + "/>";
        if (type === "desk") o += '<rect x="' + (x + w * 0.15) + '" y="' + (y + h * 0.2) + '" width="' + w * 0.22 + '" height="' + h * 0.55 + '" fill="' + C.panel + '" ' + s + ' transform="rotate(-8 ' + (x + w * 0.26) + " " + cy + ')"/><rect x="' + (x + w * 0.45) + '" y="' + (y + h * 0.25) + '" width="' + w * 0.2 + '" height="' + h * 0.5 + '" fill="' + C.panel + '" ' + s + '/><circle cx="' + (x + w * 0.82) + '" cy="' + cy + '" r="' + Math.min(4, h * 0.15) + '" fill="' + C.ink2 + '"/>';
        else o += '<rect x="' + (x + 3) + '" y="' + (y + 3) + '" width="' + (w - 6) + '" height="' + (h - 6) + '" fill="none" stroke="' + C.ink3 + '" stroke-width="0.5"/>'; break;
      case "chair": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" ' + f + " " + s + '/><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + Math.max(3, h * 0.2) + '" fill="' + C.ink3 + '"/>'; break;
      case "armchair": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" ' + f + " " + s + '/><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h * 0.25 + '" rx="3" fill="' + C.ink3 + '" opacity=".55"/><rect x="' + (x - 2) + '" y="' + (y + h * 0.2) + '" width="5" height="' + h * 0.75 + '" rx="2" fill="' + C.ink3 + '" opacity=".55"/><rect x="' + (x + w - 3) + '" y="' + (y + h * 0.2) + '" width="5" height="' + h * 0.75 + '" rx="2" fill="' + C.ink3 + '" opacity=".55"/>'; break;
      case "rocking_chair": o += g("chair", x + 3, y, w - 6, h - 6) + '<path d="M' + x + " " + (y + h - 2) + " q" + w / 2 + " 6 " + w + ' 0" fill="none" ' + s + "/>"; break;
      case "sofa": case "chaise": o += '<path d="M' + x + " " + y + " h" + w + " v" + h + " h" + -w * 0.85 + " q" + -w * 0.15 + " 0 " + -w * 0.15 + " " + -h * 0.4 + ' z" ' + f + " " + s + '/><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h * 0.25 + '" fill="' + C.ink3 + '" opacity=".5"/>'; break;
      case "rug": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#a8574a" opacity=".35" ' + s + '/><rect x="' + (x + 5) + '" y="' + (y + 5) + '" width="' + (w - 10) + '" height="' + (h - 10) + '" fill="none" stroke="' + C.ink2 + '" stroke-width=".6"/><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + w * 0.2 + '" ry="' + h * 0.18 + '" fill="none" stroke="' + C.ink2 + '" stroke-width=".7"/>'; break;
      case "fireplace": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + C.furn + '" ' + s + '/><rect x="' + (x + w * 0.25) + '" y="' + (y + h * 0.2) + '" width="' + w * 0.5 + '" height="' + h * 0.6 + '" fill="url(#km-x)" ' + s + "/>"; break;
      case "range": case "stove": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#5d5650" ' + s + '/><circle cx="' + (x + w * 0.3) + '" cy="' + cy + '" r="' + Math.min(w, h) * 0.18 + '" fill="none" stroke="#cfc6b4"/><circle cx="' + (x + w * 0.7) + '" cy="' + cy + '" r="' + Math.min(w, h) * 0.18 + '" fill="none" stroke="#cfc6b4"/>'; break;
      case "sink": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + C.panel + '" ' + s + '/><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + w * 0.32 + '" ry="' + h * 0.3 + '" fill="#cfe0e6" ' + s + "/>"; break;
      case "dresser": case "cabinet": case "wardrobe": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" ' + f + " " + s + "/>";
        for (var i = 1; i < 3; i++) o += '<line x1="' + (x + (w > h ? w * i / 3 : 2)) + '" y1="' + (y + (w > h ? 2 : h * i / 3)) + '" x2="' + (x + (w > h ? w * i / 3 : w - 2)) + '" y2="' + (y + (w > h ? h - 2 : h * i / 3)) + '" stroke="' + C.ink3 + '" stroke-width=".6"/>'; break;
      case "bookcase": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#4b3420" ' + s + "/>";
        var n = Math.floor((w > h ? w : h) / 6); for (var j = 1; j < n; j++) o += w > h ? '<line x1="' + (x + j * 6) + '" y1="' + (y + 1) + '" x2="' + (x + j * 6) + '" y2="' + (y + h - 1) + '" stroke="#8b2d1d" stroke-width="3"/>' : '<line x1="' + (x + 1) + '" y1="' + (y + j * 6) + '" x2="' + (x + w - 1) + '" y2="' + (y + j * 6) + '" stroke="#8b2d1d" stroke-width="3"/>'; break;
      case "piano": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#3b2c1c" ' + s + '/><line x1="' + (x + 2) + '" y1="' + (y + h - 4) + '" x2="' + (x + w - 2) + '" y2="' + (y + h - 4) + '" stroke="#f3e9d0" stroke-width="3" stroke-dasharray="2 1.5"/>'; break;
      case "clock": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" ' + f + " " + s + '/><circle cx="' + cx + '" cy="' + (y + Math.min(w, h) * 0.5) + '" r="' + Math.min(w, h) * 0.32 + '" fill="none" ' + s + "/>"; break;
      case "lamp": o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + Math.max(w, h) * 1.6 + '" fill="' + C.gold + '" opacity=".14"/><circle cx="' + cx + '" cy="' + cy + '" r="' + Math.max(3, Math.min(w, h) / 2) + '" fill="' + C.gold + '" ' + s + "/>"; break;
      case "coat_rack": o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + Math.min(w, h) / 2 + '" fill="url(#km-h)" ' + s + '/><path d="M' + (cx - w / 2) + " " + cy + " h" + w + " M" + cx + " " + (cy - h / 2) + " v" + h + '" stroke="' + C.ink + '"/>'; break;
      case "boots": o += '<ellipse cx="' + (x + w * 0.3) + '" cy="' + cy + '" rx="' + w * 0.18 + '" ry="' + h * 0.45 + '" fill="' + C.ink3 + '"/><ellipse cx="' + (x + w * 0.72) + '" cy="' + cy + '" rx="' + w * 0.18 + '" ry="' + h * 0.45 + '" fill="' + C.ink3 + '"/>'; break;
      case "trunk": case "crate": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#9c7a4a" ' + s + '/><path d="M' + x + " " + y + " L" + (x + w) + " " + (y + h) + " M" + (x + w) + " " + y + " L" + x + " " + (y + h) + '" stroke="' + C.ink2 + '" stroke-width=".7"/>'; break;
      case "barrel": o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + Math.min(w, h) / 2 + '" fill="#9c7a4a" ' + s + '/><circle cx="' + cx + '" cy="' + cy + '" r="' + Math.min(w, h) / 3 + '" fill="none" stroke="' + C.ink2 + '"/>'; break;
      case "plant": o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + Math.min(w, h) / 2 + '" fill="url(#km-h)" ' + s + '/><path d="M' + cx + " " + cy + " q-8 -6 -4 -12 M" + cx + " " + cy + " q8 -6 4 -12 M" + cx + " " + cy + " q-10 0 -12 -6 M" + cx + " " + cy + ' q10 0 12 -6" fill="none" stroke="#4d5a32"/>'; break;
      case "bath": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="' + C.panel + '" ' + s + '/><rect x="' + (x + 4) + '" y="' + (y + 4) + '" width="' + (w - 8) + '" height="' + (h - 8) + '" rx="6" fill="#cfe0e6" stroke="' + C.ink3 + '" stroke-width=".6"/>'; break;
      case "footprints": var k = Math.max(2, Math.floor(Math.max(w, h) / 16)); for (var q = 0; q < k; q++) { var t = (q + 0.5) / k; o += '<ellipse cx="' + (w > h ? x + t * w : cx + (q % 2 ? 4 : -4)) + '" cy="' + (w > h ? cy + (q % 2 ? 4 : -4) : y + t * h) + '" rx="' + (w > h ? 6 : 3) + '" ry="' + (w > h ? 3 : 6) + '" fill="' + C.ink2 + '"/>'; } break;
      case "trapdoor": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#6b4d31" ' + s + ' stroke-dasharray="4 2"/><circle cx="' + (x + w - 6) + '" cy="' + cy + '" r="2.5" fill="none" ' + s + "/>"; break;
      case "grave": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + Math.min(w, h) / 2 + '" fill="#cfc6b4" ' + s + "/>"; break;
      case "tree": o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + Math.min(w, h) / 2 + '" fill="url(#km-h)" ' + s + "/>"; break;
      case "car": o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="#3b2c1c" ' + s + '/><rect x="' + (x + w * 0.35) + '" y="' + (y + 3) + '" width="' + w * 0.35 + '" height="' + (h - 6) + '" fill="#7b9aa8" opacity=".6"/>'; break;
      default: o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" ' + f + " " + s + "/>";
    }
    return o;
  }

  /* ---------- main render ---------- */
  function render(target, opts) {
    var el = typeof target === "string" ? document.getElementById(target) : target;
    var map = typeof opts.map === "string" ? MAPS[opts.map] : opts.map;
    if (!el) return;
    if (!map) { el.innerHTML = '<p style="font-family:Georgia,serif;font-style:italic">Map "' + esc(opts.map) + '" not loaded.</p>'; return; }
    var explored = {}, glimpsed = {}, found = {};
    (opts.explored || []).forEach(function (r) { explored[r] = 1; });
    (opts.glimpsed || []).forEach(function (r) { glimpsed[r] = 1; });
    (opts.found || []).forEach(function (r) { found[r] = 1; });
    var all = {};
    map.floors.forEach(function (fl) {
      (fl.rooms || []).forEach(function (r) { all[r.id] = { t: "room", o: r, f: fl }; });
      (fl.stairs || []).forEach(function (r) { all[r.id] = { t: "stairs", o: r, f: fl }; });
      (fl.items || []).forEach(function (r) { all[r.id] = { t: "item", o: r, f: fl }; });
    });
    function state(roomId) {
      var r = all[roomId]; if (!r) return "unknown";
      if (r.o.hidden && !found[roomId]) return "unknown";
      return explored[roomId] ? "explored" : glimpsed[roomId] ? "glimpsed" : "unknown";
    }
    var imgs = opts.images || {};
    function imgUrl(id) { var v = imgs[id]; if (!v) return ""; if (/^https?:/.test(v)) return v; return (opts.base || BASE || "https://cdn.jsdelivr.net/gh/polkovitch/keeper-maps@") + v; }
    var atRef = all[opts.at];
    var floorId = opts.floor || (atRef ? atRef.f.id : map.floors[0].id);
    var visibleFloors = map.floors.filter(function (fl) { return (fl.rooms || []).some(function (r) { return state(r.id) !== "unknown"; }) || fl.id === floorId; });
    var act = function (text) {
      if (typeof root.sendPrompt === "function") { root.sendPrompt(text); return; }
      if (typeof opts.onAction === "function") { opts.onAction(text); return; }
      try { navigator.clipboard.writeText(text); } catch (e) {}
      var t = el.querySelector(".km-toast"); if (t) t.textContent = "Copied \u2014 paste it in the chat: \u201c" + text + "\u201d";
    };

    function draw(fid) {
      var fl = map.floors.filter(function (f) { return f.id === fid; })[0];
      var W = fl.w, H = fl.h, s = Math.min(560 / W, 330 / H), ox = 60 + (560 - W * s) / 2, oy = 100;
      function X(v) { return +(ox + v * s).toFixed(1); } function Y(v) { return +(oy + v * s).toFixed(1); } function S(v) { return +(v * s).toFixed(1); }
      var VH = Math.round(oy + H * s + 92);
      var o = '<svg width="100%" viewBox="0 0 680 ' + VH + '" role="img" style="display:block"><title>' + esc(map.title + " \u00b7 " + fl.name) + "</title><desc>Floor plan revealing explored areas only</desc>";
      o += '<defs><pattern id="km-h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="' + C.ink3 + '" stroke-width="0.7"/></pattern><pattern id="km-x" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V5M0 0H5" stroke="' + C.ink2 + '" stroke-width="0.8"/></pattern><pattern id="km-b" width="200" height="9" patternUnits="userSpaceOnUse"><line x1="0" y1="9" x2="200" y2="9" stroke="#b9a37a" stroke-width="0.5"/><line x1="70" y1="0" x2="70" y2="9" stroke="#b9a37a" stroke-width="0.5"/><line x1="160" y1="0" x2="160" y2="9" stroke="#b9a37a" stroke-width="0.5"/></pattern><pattern id="km-t" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#e6d8b8"/><path d="M7 0L14 7L7 14L0 7Z" fill="none" stroke="#9c855e" stroke-width="0.6"/></pattern><pattern id="km-s" width="18" height="12" patternUnits="userSpaceOnUse"><rect width="18" height="12" fill="#d8d0bc"/><path d="M0 6h18M9 0v6M0 6v6M18 6v6" stroke="#9c9280" stroke-width="0.6"/></pattern><pattern id="km-g" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#dfd6b4"/><path d="M3 12l1-4M9 14l1-5M13 9l-1-3" stroke="#9aa07a" stroke-width="0.7"/></pattern></defs>';
      o += '<rect width="680" height="' + VH + '" fill="' + C.paper + '"/><rect x="12" y="12" width="656" height="' + (VH - 24) + '" fill="none" stroke="' + C.ink2 + '" stroke-width="2"/><rect x="20" y="20" width="640" height="' + (VH - 40) + '" fill="none" stroke="' + C.ink2 + '" stroke-width="0.6"/>';
      o += '<g fill="none" stroke="' + C.ink2 + '" stroke-width="0.9"><path d="M20 44 Q32 32 44 20 M32 36 a6 6 0 1 1 6 -6"/><path d="M660 44 Q648 32 636 20 M648 36 a6 6 0 1 0 -6 -6"/><path d="M20 ' + (VH - 44) + " Q32 " + (VH - 32) + " 44 " + (VH - 20) + '"/><path d="M660 ' + (VH - 44) + " Q648 " + (VH - 32) + " 636 " + (VH - 20) + '"/></g>';
      o += '<rect x="170" y="30" width="340" height="46" fill="' + C.panel + '" stroke="' + C.ink2 + '"/><rect x="174" y="34" width="332" height="38" fill="none" stroke="' + C.ink2 + '" stroke-width=".5"/>';
      o += '<text x="340" y="52" text-anchor="middle" style="font-family:Georgia,serif;font-size:16px;fill:' + C.ink + ';letter-spacing:2px">' + esc("Plan of the " + fl.name.toLowerCase()) + "</text>";
      o += '<text x="340" y="67" text-anchor="middle" style="font-family:Georgia,serif;font-size:11px;fill:' + C.ink3 + ';font-style:italic">' + esc(map.title + (map.subtitle ? " \u00b7 " + map.subtitle : "")) + "</text>";
      // outdoor ground / building footprint in darkness
      if (fl.ground) o += '<rect x="' + X(0) + '" y="' + Y(0) + '" width="' + S(W) + '" height="' + S(H) + '" fill="url(#km-g)"/>';
      var fp = fl.footprint || [0, 0, W, H];
      o += '<rect x="' + X(fp[0]) + '" y="' + Y(fp[1]) + '" width="' + S(fp[2]) + '" height="' + S(fp[3]) + '" fill="' + C.ink2 + '" opacity=".82"/><rect x="' + X(fp[0]) + '" y="' + Y(fp[1]) + '" width="' + S(fp[2]) + '" height="' + S(fp[3]) + '" fill="url(#km-x)" opacity=".5"/>';
      var rooms = fl.rooms || [], stairs = fl.stairs || [], items = fl.items || [], doors = fl.doors || [], wins = fl.windows || [];
      // room fills
      rooms.forEach(function (r) {
        var st = state(r.id); if (st === "unknown") return;
        var x = X(r.x), y = Y(r.y), w = S(r.w), h = S(r.h);
        if (st === "glimpsed") o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + C.wash + '"/><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#km-h)" opacity=".5"/>';
        else { var pat = { boards: "km-b", tile: "km-t", stone: "km-s", grass: "km-g" }[r.floor || "boards"] || "km-b"; o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + C.paper2 + '"/><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#' + pat + ')"/>'; }
      });
      // stairs
      stairs.forEach(function (st) {
        var rs = state(st.room); if (rs === "unknown" || (st.hidden && !found[st.id])) return;
        var x = X(st.x), y = Y(st.y), w = S(st.w), h = S(st.h), n = Math.max(4, Math.round((w > h ? w : h) / 12));
        o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + (rs === "explored" ? C.furn : "none") + '" stroke="' + C.ink2 + '" stroke-width=".8"/>';
        for (var i = 1; i < n; i++) o += w > h ? '<line x1="' + (x + w * i / n) + '" y1="' + y + '" x2="' + (x + w * i / n) + '" y2="' + (y + h) + '" stroke="' + C.ink2 + '" stroke-width=".7"/>' : '<line x1="' + x + '" y1="' + (y + h * i / n) + '" x2="' + (x + w) + '" y2="' + (y + h * i / n) + '" stroke="' + C.ink2 + '" stroke-width=".7"/>';
      });
      // items (explored rooms only, hidden ones once found)
      items.forEach(function (it) {
        if (state(it.room) !== "explored" || (it.hidden && !found[it.id])) return;
        var x = X(it.x), y = Y(it.y), w = S(it.w || 2), h = S(it.h || 2);
        var body = g(it.type, x, y, w, h);
        o += it.rot ? '<g transform="rotate(' + it.rot + " " + (x + w / 2) + " " + (y + h / 2) + ')">' + body + "</g>" : body;
      });
      // walls
      rooms.forEach(function (r) { if (state(r.id) === "unknown") return; o += '<rect x="' + X(r.x) + '" y="' + Y(r.y) + '" width="' + S(r.w) + '" height="' + S(r.h) + '" fill="none" stroke="' + C.ink + '" stroke-width="6"/>'; });
      // windows
      wins.forEach(function (wn) {
        if (state(wn.room) === "unknown") return;
        var x = X(wn.x), y = Y(wn.y), l = S(wn.len);
        if (wn.orient === "h") o += '<rect x="' + x + '" y="' + (y - 3.5) + '" width="' + l + '" height="7" fill="' + C.paper + '"/><path d="M' + x + " " + (y - 1.5) + "h" + l + "M" + x + " " + (y + 1.5) + "h" + l + '" stroke="' + C.glass + '" stroke-width="1.2"' + (wn.open ? ' stroke-dasharray="5 3"' : "") + "/>";
        else o += '<rect x="' + (x - 3.5) + '" y="' + y + '" width="7" height="' + l + '" fill="' + C.paper + '"/><path d="M' + (x - 1.5) + " " + y + "v" + l + "M" + (x + 1.5) + " " + y + "v" + l + '" stroke="' + C.glass + '" stroke-width="1.2"' + (wn.open ? ' stroke-dasharray="5 3"' : "") + "/>";
      });
      // doors
      doors.forEach(function (d) {
        var vis = (d.rooms || []).some(function (rid) { return state(rid) !== "unknown"; });
        if (!vis || (d.hidden && !found[d.id])) return;
        var x = X(d.x), y = Y(d.y), l = S(d.len || 3), sw = d.swing || 1, fill = (d.rooms || []).some(function (rid) { return state(rid) === "explored"; }) ? C.paper2 : C.wash;
        var dash = d.kind === "secret" ? ' stroke-dasharray="3 2"' : "";
        if (d.orient === "h") {
          o += '<rect x="' + x + '" y="' + (y - 4) + '" width="' + l + '" height="8" fill="' + fill + '"/>';
          if (d.kind !== "arch") o += '<path d="M' + x + " " + (y + sw * l) + " A" + l + " " + l + " 0 0 " + (sw > 0 ? 0 : 1) + " " + (x + l) + " " + y + '" fill="none" stroke="' + C.ink + '" stroke-width=".8" stroke-dasharray="3 2"/><line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + sw * l) + '" stroke="' + C.ink + '" stroke-width="1.8"' + dash + "/>";
        } else {
          o += '<rect x="' + (x - 4) + '" y="' + y + '" width="8" height="' + l + '" fill="' + fill + '"/>';
          if (d.kind !== "arch") o += '<path d="M' + (x + sw * l) + " " + y + " A" + l + " " + l + " 0 0 " + (sw > 0 ? 1 : 0) + " " + x + " " + (y + l) + '" fill="none" stroke="' + C.ink + '" stroke-width=".8" stroke-dasharray="3 2"/><line x1="' + x + '" y1="' + y + '" x2="' + (x + sw * l) + '" y2="' + y + '" stroke="' + C.ink + '" stroke-width="1.8"' + dash + "/>";
        }
      });
      // labels
      rooms.forEach(function (r) {
        var st = state(r.id); if (st === "unknown" || r.nolabel) return;
        var lx = r.label ? X(r.label[0]) : X(r.x + r.w / 2), ly = r.label ? Y(r.label[1]) : Y(r.y) + (r.labelAt === "bottom" ? S(r.h) - 10 : 18);
        o += '<text x="' + lx + '" y="' + ly + '" text-anchor="middle" style="font-family:Georgia,serif;font-style:italic;font-size:12px;paint-order:stroke;stroke:' + (st === "explored" ? C.paper2 : C.wash) + ';stroke-width:4px;fill:' + (st === "explored" ? C.ink : "#4a3826") + '">' + esc(r.name + (st === "glimpsed" ? " (unsurveyed)" : "")) + "</text>";
      });
      rooms.forEach(function (r) { if (state(r.id) === "unknown" || !imgs[r.id]) return; o += '<text x="' + (X(r.x + r.w) - 12) + '" y="' + (Y(r.y) + 18) + '" text-anchor="middle" style="font-size:13px;fill:' + C.seal + '">\u2726</text>'; });
      stairs.forEach(function (st) { if (state(st.room) === "unknown" || (st.hidden && !found[st.id])) return; o += '<text x="' + X(st.x + st.w / 2) + '" y="' + (Y(st.y + st.h) + 13) + '" text-anchor="middle" style="font-family:Georgia,serif;font-style:italic;font-size:11px;fill:' + C.ink3 + '">' + esc(st.label || (st.dir === "down" ? "Stair down" : "Stair up")) + "</text>"; });
      // investigator
      if (atRef && atRef.f.id === fid) {
        var a = atRef.o, px = X((a.px != null ? a.px : a.x + (a.w || 2) / 2)), py = Y((a.py != null ? a.py : a.y + (a.h || 2) / 2));
        if (opts.atX != null) { px = X(opts.atX); py = Y(opts.atY); }
        o += '<circle cx="' + px + '" cy="' + py + '" r="10" fill="' + C.seal + '"/><circle cx="' + px + '" cy="' + py + '" r="7" fill="none" stroke="#c9584a" stroke-width=".8"/><path d="M' + (px - 3) + " " + (py - 3) + "l6 6M" + (px + 3) + " " + (py - 3) + 'l-6 6" stroke="#f0c9a8" stroke-width=".8"/>';
      }
      // compass, scale, legend
      var by = VH - 46;
      o += '<g transform="translate(612,' + by + ')" stroke="' + C.ink + '" fill="none" stroke-width=".8"><circle r="18"/><path d="M0 -22 L4 0 L0 22 L-4 0Z" fill="' + C.ink2 + '"/><path d="M-22 0 L0 3 L22 0 L0 -3Z" fill="' + C.furn + '"/><text y="-25" text-anchor="middle" stroke="none" fill="' + C.ink + '" style="font-family:Georgia,serif;font-size:11px">N</text></g>';
      var ten = S(10); o += '<g transform="translate(60,' + by + ')"><rect width="' + ten + '" height="5" fill="' + C.ink + '"/><rect x="' + ten / 2 + '" width="' + ten / 2 + '" height="5" fill="' + C.paper + '" stroke="' + C.ink + '" stroke-width=".6"/><text x="0" y="18" style="font-family:Georgia,serif;font-size:11px;fill:' + C.ink + '">0</text><text x="' + (ten - 24) + '" y="18" style="font-family:Georgia,serif;font-size:11px;fill:' + C.ink + '">10 ft</text></g>';
      var lx0 = Math.max(220, 60 + ten + 40);
      o += '<g style="font-family:Georgia,serif;font-size:11px;fill:' + C.ink3 + ';font-style:italic"><circle cx="' + lx0 + '" cy="' + by + '" r="5" fill="' + C.seal + '"/><text x="' + (lx0 + 10) + '" y="' + (by + 4) + '">Investigator</text><rect x="' + (lx0 + 90) + '" y="' + (by - 5) + '" width="10" height="10" fill="' + C.wash + '" stroke="' + C.ink3 + '" stroke-width=".5"/><text x="' + (lx0 + 105) + '" y="' + (by + 4) + '">Glimpsed</text><rect x="' + (lx0 + 170) + '" y="' + (by - 5) + '" width="10" height="10" fill="' + C.ink2 + '"/><text x="' + (lx0 + 185) + '" y="' + (by + 4) + '">Unknown</text></g>';
      // hotspots
      var hs = [], active = !atRef || atRef.f.id === fid;
      function hot(x, y, w, h, label, action, room) {
        if (!action) return;
        if (!active) { if (room && imgs[room]) hs.push('<g data-room="' + esc(room) + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="transparent"/></g>'); return; }
        var lw = Math.round(label.length * 6.6 + 18), lx = x + w + 6, ly = y + h / 2 - 11;
        if (lx + lw > 650) lx = x - lw - 6; if (lx < 26) lx = Math.max(26, Math.min(650 - lw, x + w / 2 - lw / 2)), ly = y + h + 4; if (ly + 22 > VH - 26) ly = y - 26; if (ly < 26) ly = 26;
        hs.push('<g class="km-hot" data-a="' + esc(action) + '"' + (room ? ' data-room="' + esc(room) + '"' : "") + '><rect class="hl" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="transparent"/><g class="km-lbl"><rect x="' + lx + '" y="' + ly + '" width="' + lw + '" height="22" rx="3"/><text x="' + (lx + lw / 2) + '" y="' + (ly + 15) + '" text-anchor="middle">' + esc(label) + "</text></g></g>");
      }
      rooms.forEach(function (r) {
        var st = state(r.id); if (st === "unknown") return;
        var here = atRef && (opts.at === r.id || (atRef.o.room === r.id));
        var label = st === "glimpsed" ? (r.enterLabel || "Go to the " + r.name.toLowerCase()) : (here ? (r.searchLabel || "Search the " + r.name.toLowerCase()) : (r.enterLabel || "Go to the " + r.name.toLowerCase()));
        var action = st === "glimpsed" || !here ? (r.enter || "I go into the " + r.name.toLowerCase() + ".") : (r.search || "I search the " + r.name.toLowerCase() + ".");
        hot(X(r.x) + 4, Y(r.y) + 4, S(r.w) - 8, S(r.h) - 8, label, action, r.id);
      });
      stairs.forEach(function (st) { if (state(st.room) === "unknown" || (st.hidden && !found[st.id])) return; hot(X(st.x), Y(st.y), S(st.w), S(st.h), st.dir === "down" ? "Go down" : "Go up", st.action || (st.dir === "down" ? "I go down the stairs." : "I go up the stairs.")); });
      items.forEach(function (it) { if (state(it.room) !== "explored" || (it.hidden && !found[it.id]) || !it.label) return; var pad = 4; hot(X(it.x) - pad, Y(it.y) - pad, S(it.w || 2) + pad * 2, S(it.h || 2) + pad * 2, it.label, it.action || ("I examine the " + it.label.toLowerCase() + "."), imgs[it.id] ? it.id : it.room); });
      if (!active) o += '<text x="340" y="92" text-anchor="middle" style="font-family:Georgia,serif;font-style:italic;font-size:11px;fill:' + C.ink3 + '">View only \u2014 you are on another floor</text>';
      o += hs.join("") + "</svg>";
      return o;
    }

    var html = "<style>" + STYLE + "</style>";
    if (visibleFloors.length > 1) html += '<div class="km-tabs">' + visibleFloors.map(function (f) { return '<button data-f="' + esc(f.id) + '"' + (f.id === floorId ? ' class="on"' : "") + ">" + esc(f.name) + "</button>"; }).join("") + "</div>";
    html += '<div class="km-wrap"><div class="km-svg">' + draw(floorId) + '</div><div class="km-pv"><button aria-label="Close picture">\u2715</button><img alt=""><div></div></div></div>';
    if (opts.actions && opts.actions.length) html += '<div class="km-acts">' + opts.actions.map(function (a) { return '<button data-a="' + esc(a[1]) + '">' + esc(a[0]) + ' <span aria-hidden="true">\u2197</span></button>'; }).join("") + "</div>";
    html += '<div class="km-toast"></div>';
    el.innerHTML = html;
    var pv = el.querySelector(".km-pv"), pvImg = pv.querySelector("img"), pvCap = pv.querySelector("div");
    function nameOf(id) { var r = all[id]; return r ? (r.o.name || r.o.label || id) : id; }
    var pvClosed = null, pvId = null;
    function showPv(id, pin) { if (!pin && id === pvClosed) return false; var u = imgUrl(id); if (!u) return false; pvId = id; if (pvImg.getAttribute("src") !== u) pvImg.src = u; pvCap.textContent = nameOf(id); pv.classList.add("on"); pv.classList.toggle("pin", !!pin); return true; }
    function hidePv() { if (!pv.classList.contains("pin")) pv.classList.remove("on"); }
    el.addEventListener("mouseover", function (e) { if (e.target.closest(".km-pv")) return; var h = e.target.closest("[data-room]"); if (h) { var id = h.getAttribute("data-room"); if (id !== pvClosed) pvClosed = null; showPv(id); } else { pvClosed = null; hidePv(); } });
    el.addEventListener("mouseleave", function () { pvClosed = null; hidePv(); });
    pv.onclick = function (e) { e.stopPropagation(); e.preventDefault(); pvClosed = pvId; pv.classList.remove("pin", "on"); };
    if (opts.show) showPv(opts.show, true);
    el.onclick = function (e) {
      var b = e.target.closest("[data-f]");
      if (b) { el.querySelectorAll(".km-tabs button").forEach(function (x) { x.classList.toggle("on", x === b); }); el.querySelector(".km-svg").innerHTML = draw(b.getAttribute("data-f")); return; }
      var h = e.target.closest("[data-a]"); if (h) act(h.getAttribute("data-a"));
    };
  }

  root.KeeperMap = { define: define, render: render, version: "1.3.0", _maps: MAPS };
})(typeof window !== "undefined" ? window : this);
