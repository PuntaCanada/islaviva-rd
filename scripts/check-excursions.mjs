import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const d=JSON.parse(readFileSync('data/excursions.json','utf8'));
assert.equal(d.schemaVersion,1);
assert.equal(new Set(d.places.map(p=>p.id)).size,d.places.length);
for(const p of d.places){assert.match(p.id,/^[a-z0-9-]+$/);assert.ok(p.name&&p.region);assert.match(p.source,/^https:\/\//);assert.match(p.identityReviewedOn,/^\d{4}-\d{2}-\d{2}$/);assert.equal(p.automationAllowed,false);assert.deepEqual(p.prices,[]);assert.deepEqual(p.priceHistory,[]);}
console.log('Validated '+d.places.length+' excursion records');
