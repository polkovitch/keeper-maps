# keeper-maps

Floor-plan engine for tabletop RPG sessions run by Claude as Keeper (Call of Cthulhu).
`engine.js` draws a place in a Victorian engraved style and reveals only explored areas;
`maps/*.js` hold lightly obfuscated plans (spoilers — please don't decode if you're the player!).

```html
<div id="km"></div>
<script src="https://cdn.jsdelivr.net/gh/polkovitch/keeper-maps@<commit>/engine.js"></script>
<script src="https://cdn.jsdelivr.net/gh/polkovitch/keeper-maps@<commit>/maps/<id>.js"></script>
<script>KeeperMap.render('km', {map:'<id>', explored:[...], glimpsed:[...], found:[...], at:'<id>'})</script>
```
