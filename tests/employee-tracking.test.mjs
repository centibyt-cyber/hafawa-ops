import test from 'node:test';
import assert from 'node:assert/strict';
import { initialTracking, riyadhDate, dayNumber, blankTrack, newEmployee, trackState, summary, addType, validateEmployee, normalizeTracking, archiveEmployee, renewTrack, employeeFiles, sortEmployees, typeRows } from '../src/employee-tracking-model.mjs';
import { createReport } from '../src/employee-tracking-report-model.mjs';

test('Riyadh calendar rolls at 21:00 UTC independently of device timezone', () => {
  assert.equal(riyadhDate(new Date('2026-10-08T20:59:59Z')), '2026-10-08');
  assert.equal(riyadhDate(new Date('2026-10-08T21:00:00Z')), '2026-10-09');
  assert.equal(dayNumber('2026-02-30'), null);
  assert.notEqual(dayNumber('2028-02-29'), null);
});
test('separate thresholds, inclusive boundaries, today and expiry', () => {
  const [iqama,pass] = initialTracking().types;
  const track = { ...blankTrack(), expiresOn:'2026-11-07' };
  assert.equal(trackState(iqama,track,'2026-10-08').state,'soon');
  assert.equal(trackState(pass,track,'2026-10-08').state,'ok');
  assert.equal(trackState(pass,{...track,expiresOn:'2026-10-18'},'2026-10-08').state,'soon');
  assert.equal(trackState(pass,{...track,expiresOn:'2026-10-19'},'2026-10-08').state,'ok');
  assert.equal(trackState(pass,{...track,expiresOn:'2026-10-08',alertDays:0},'2026-10-08').state,'soon');
  assert.equal(trackState(pass,{...track,expiresOn:'2026-10-07'},'2026-10-08').state,'expired');
  assert.equal(trackState(iqama,{...track,alertDays:0},'2026-10-08').state,'ok');
  assert.equal(trackState(pass,{...track,alertDays:31},'2026-10-08').state,'soon');
  assert.equal(trackState(iqama,track,'2026-10-08').alertOn,'2026-10-08');
  assert.equal(trackState(iqama,{...track,expiresOn:'2027-01-01'},'2026-10-08').state,'ok');
});
test('counts are unique employees per metric; expiry and missing remain separate', () => {
  const data = initialTracking(); const employee = newEmployee(data.types,{name:'Test Employee'});
  employee.tracks.iqama.expiresOn='2026-10-10'; employee.tracks['run-pass'].expiresOn='2026-10-12';
  data.employees=[employee]; let s=summary(data,'2026-10-08');
  assert.equal(s.soon,1); assert.equal(s.missing,1); assert.equal(s.attention,1);
  assert.equal(s.types.iqama,1); assert.equal(s.types['run-pass'],1);
  employee.tracks.iqama.expiresOn='2026-10-01'; s=summary(data,'2026-10-08');
  assert.equal(s.expired,1); assert.equal(s.types.iqama,0);
  employee.tracks.municipal.status=true; employee.tracks.analysis.status=true;
  employee.tracks.municipal.expiresOn='2027-01-01'; employee.tracks.analysis.expiresOn='2027-01-01';
  assert.equal(summary(data,'2026-10-08').missing,0);
  data.employees=[]; assert.equal(summary(data,'2026-10-08').attention,0);
});

test('v1 upgrades without inventing dates, overwriting statuses or dropping attachments/unknown data', () => {
  const before=initialTracking();before.schemaVersion=1;before.otherSetting={preserved:true};
  before.types.find(t=>t.id==='analysis').kind='status';
  const e=newEmployee(before.types,{name:'Legacy'});e.tracks.analysis.status=true;e.tracks.municipal.status=false;
  e.tracks.analysis.files=[{path:'old/private.pdf',name:'original.pdf'}];e.tracks.analysis.notes='Keep me';before.employees=[e];
  const original=structuredClone(before),after=normalizeTracking(before);
  assert.deepEqual(before,original);assert.equal(after.schemaVersion,2);assert.equal(after.employees[0].tracks.analysis.expiresOn,'');
  assert.equal(after.types.find(t=>t.id==='analysis').kind,'expiry');
  assert.equal(trackState(after.types[3],after.employees[0].tracks.analysis,'2026-10-10').reason,'date');
  assert.equal(trackState(after.types[2],after.employees[0].tracks.municipal,'2026-10-10').reason,'absent');
  assert.deepEqual(after.employees[0].tracks.analysis.files,e.tracks.analysis.files);assert.equal(after.employees[0].tracks.analysis.notes,'Keep me');
  assert.deepEqual(after.otherSetting,before.otherSetting);assert.deepEqual(normalizeTracking(after),after);
  assert.throws(()=>normalizeTracking({...before,schemaVersion:99}),/TRACKING_VERSION/);
});

test('medical expiry, absent document, unknown data and exemptions stay distinct',()=>{
 const d=initialTracking(),type=d.types[3],today='2026-10-10';
 assert.equal(trackState(type,blankTrack(),today).reason,'unrecorded');
 assert.equal(trackState(type,{...blankTrack(),status:true},today).reason,'date');
 assert.equal(trackState(type,{...blankTrack(),status:false},today).reason,'not_done');
 const e=newEmployee(d.types,{name:'Exempt'});for(const track of Object.values(e.tracks))track.required=false;
 e.tracks.iqama.expiresOn='2020-01-01';d.employees=[e];
 assert.equal(summary(d,today).attention,0);assert.equal(summary(d,today).alerts.length,0);
 assert.equal(summary(d,today).byType.iqama.exempt,1);
 assert.equal(trackState(type,{...blankTrack(),status:true,expiresOn:'2026-10-11',alertDays:0},today).state,'ok');
});

test('archive excludes and restore reinstates alerts, records and history files',()=>{
 const d=initialTracking(),e=newEmployee(d.types,{name:'A'});e.tracks.iqama.expiresOn='2020-01-01';
 e.tracks.iqama.history=[{expiresOn:'2019-01-01',files:[{path:'history.pdf'}]}];
 d.employees=[archiveEmployee(e,true)];assert.equal(summary(d).total,0);assert.equal(summary(d).archived,1);assert.deepEqual(summary(d).alerts,[]);
 assert.equal(typeRows(d,'iqama').length,0);assert.equal(typeRows(d,'iqama',undefined,{archive:'archived'}).length,1);
 assert.ok(employeeFiles(d.employees[0]).some(f=>f.path==='history.pdf'));
 d.employees=[archiveEmployee(d.employees[0],false)];assert.equal(summary(d).expired,1);assert.equal(d.employees[0].tracks.iqama.history.length,1);
});

test('renewal preserves previous dates/files and evaluates only current expiry',()=>{
 const track={...blankTrack(),expiresOn:'2026-10-01',notes:'Original',files:[{path:'old.pdf'}],alertDays:5};
 const renewed=renewTrack(track,{expiresOn:'2027-10-01',notes:'New',files:[{path:'new.pdf'}]},'2026-10-10T00:00:00Z');
 assert.equal(renewed.history[0].expiresOn,'2026-10-01');assert.deepEqual(renewed.history[0].files,[{path:'old.pdf'}]);assert.equal(renewed.history[0].notes,'Original');
 assert.equal(track.history.length,0);assert.equal(renewed.alertDays,5);
 assert.equal(trackState(initialTracking().types[0],renewed,'2026-10-10').state,'ok');
 const again=renewTrack(renewed,{expiresOn:'2028-10-01',files:[]});assert.equal(again.history.length,2);
 assert.deepEqual(employeeFiles({tracks:{a:again}}).map(f=>f.path),['old.pdf','new.pdf']);
 assert.throws(()=>renewTrack(track,{expiresOn:'2026-02-30'}),/RENEWAL_DATE/);
 assert.throws(()=>renewTrack(track,{expiresOn:'2026-10-01'}),/RENEWAL_DATE/);
});

test('exports use filtered population; archived/exempt/unknown counts and sorting reconcile',()=>{
 const d=initialTracking();d.employees=['Soon2','Expired','Missing','Soon1','Exempt','Archived'].map(name=>newEmployee(d.types,{name}));
 const dates=['2026-10-20','2026-10-01','','2026-10-12','2020-01-01','2020-01-01'];
 d.employees.forEach((e,i)=>e.tracks.iqama.expiresOn=dates[i]);d.employees[4].tracks.iqama.required=false;d.employees[5].archivedAt='2026-10-01';
 const opts={now:new Date('2026-10-10T10:00:00Z')},r=createReport(d,'iqama',opts);
 assert.equal(r.counts.total,5);assert.equal(r.counts.expired,1);assert.equal(r.counts.soon,2);assert.equal(r.counts.missing,1);assert.equal(r.counts.exempt,1);
 assert.deepEqual(r.rows.map(x=>x.values[0]),['Expired','Soon1','Soon2','Missing','Exempt']);
 const soon=createReport(d,'iqama',{...opts,filter:'soon'});assert.equal(soon.counts.total,2);assert.equal(soon.counts.expired,0);assert.equal(soon.counts.soon,soon.rows.length);
 assert.equal(createReport(d,'iqama',{...opts,archive:'archived'}).counts.total,1);
 assert.equal(createReport(d,'iqama',{...opts,archive:'all'}).counts.total,6);
 assert.equal(sortEmployees(d.employees.filter(e=>!e.archivedAt),[d.types[0]],'2026-10-10')[0].name,'Expired');
 const custom={id:'new-status',name:'New status',kind:'status',all:true};const extended=addType(d,custom);
 assert.equal(createReport(extended,custom.id,opts).counts.missing,5);
});
test('custom tracking can target selected staff or everyone including future hires', () => {
  let data=initialTracking(); data.employees=[newEmployee(data.types,{name:'A'}),newEmployee(data.types,{name:'B'})];
  const type={id:'training',name:'Training',kind:'expiry',alertDays:7,all:false,dashboard:true};
  data=addType(data,type,[data.employees[0].id]);
  assert.ok(data.employees[0].tracks.training); assert.equal(data.employees[1].tracks.training,undefined);
  assert.equal(newEmployee(data.types).tracks.training,undefined);
  data=addType(data,{...type,id:'passport',all:true});
  assert.ok(data.employees.every(e=>e.tracks.passport)); assert.ok(newEmployee(data.types).tracks.passport);
});
test('employee number duplicates and invalid alert overrides are rejected', () => {
  const a=newEmployee([],{name:'A',number:'HF-001'}),b=newEmployee([],{name:'B',number:' hf-001 '});
  assert.equal(validateEmployee(b,[a]),'duplicate');
  assert.equal(validateEmployee(a,[a]),null);
  a.tracks.test={...blankTrack(),alertDays:-1}; assert.equal(validateEmployee(a,[]),'days');
  a.tracks.test.alertDays=0; assert.equal(validateEmployee(a,[]),null);
});
