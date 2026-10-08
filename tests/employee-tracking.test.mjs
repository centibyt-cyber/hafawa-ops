import test from 'node:test';
import assert from 'node:assert/strict';
import { initialTracking, riyadhDate, dayNumber, blankTrack, newEmployee, trackState, summary, addType, validateEmployee } from '../src/employee-tracking-model.mjs';

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
  assert.equal(summary(data,'2026-10-08').missing,0);
  data.employees=[]; assert.equal(summary(data,'2026-10-08').attention,0);
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
