"use strict";

define(["angularMocks",
    "components/profile/motionProfile",
    "components/segments/accelSegment",
    "components/segments/indexSegment",
    "components/util/fastMath"
], function() {


    describe('Unit: profile serialization testing', function() {

        var motionProfileFactory;
        beforeEach(function() {
            module('myApp');

            inject(function(_motionProfileFactory_, _AccelSegment_, _IndexSegment_, _FastMath_) {
                motionProfileFactory = _motionProfileFactory_;
            });
        });

        it('should be able to serialize and deserialize profile with only AccelSegments', function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            profile.setInitialConditions(1, 2);

            var seg1 = motionProfileFactory.createAccelSegment("time-velocity", {
                t0: 0,
                tf: 2,
                p0: 0,
                v0: 0,
                vf: 5,
                jPct: 0.5,
                mode: "incremental"

            });

            var seg2 = motionProfileFactory.createAccelSegment("time-velocity", {
                t0: 2,
                tf: 5,
                p0: 0,
                v0: 0,
                vf: 0,
                jPct: 0.5,
                mode: "incremental"

            });

            profile.appendSegment(seg1);
            profile.appendSegment(seg2);


            // serialize
            var json = motionProfileFactory.serializeProfile(profile);

            var profileObj = JSON.parse(json);

            expect(profileObj.type).toBe("rotary");
            expect(profileObj.initialPosition).toBe(1);
            expect(profileObj.initialVelocity).toBe(2);


            var newProfile=motionProfileFactory.deserializeProfile(json);

            expect(newProfile.getAllSegments()[1].EvaluatePositionAt(5)).toBe(profile.getAllSegments()[1].EvaluatePositionAt(5));



        });

    });


    describe('Unit: motionProfileFactory testing', function() {

        var motionProfileFactory;
        var accelSegmentFactory, indexSegmentFactory, fastMath, ph;

        beforeEach(function() {
            module('myApp');

            inject(function(_motionProfileFactory_, _AccelSegment_, _IndexSegment_, _FastMath_) {
                motionProfileFactory = _motionProfileFactory_;
                accelSegmentFactory = _AccelSegment_;
                indexSegmentFactory = _IndexSegment_;
                fastMath = _FastMath_;
            });

            inject(function(_ProfileHelper_) {
                ph = _ProfileHelper_;
            });
        });

        it('should create an empty rotary profile', function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            expect(profile.ProfileType).toBe('rotary');
            expect(profile.getAllBasicSegments.length).toBe(0);
        });

        it('should create an empty linear profile', function() {

            var profile = motionProfileFactory.createMotionProfile("linear");

            expect(profile.ProfileType).toBe('linear');
            expect(profile.getAllBasicSegments.length).toBe(0);
        });

        it('should correctly delete an accel segment that is the last segment', function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var accelSegment = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 10, 0.5);

            profile.appendSegment(accelSegment);

            accelSegment = accelSegmentFactory.MakeFromTimeVelocity(2, 3, 0, 0, 7.5, 0.5);

            profile.appendSegment(accelSegment);

            profile.deleteSegment(accelSegment.id);

            var segments = profile.getAllSegments();

            expect(segments.length).toBe(1);

            var seg0 = segments[0];
            expect(seg0.initialTime).toBe(0);
            expect(seg0.finalTime).toBe(2);
            expect(seg0.EvaluatePositionAt(0.5)).toBeCloseTo(0.277777, 4);

            //also, the profile needs to be valid
            expect(ph.validateBasicSegments(profile.getAllBasicSegments())).toBe(true);


        });

        it('should correctly delete an accel segment that is NOT the last segment', function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var accelSegment = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 10, 0.5);

            profile.appendSegment(accelSegment);

            var accelSegmentDelete = accelSegmentFactory.MakeFromTimeVelocity(2, 3, 0, 0, 7.5, 0.5);

            profile.appendSegment(accelSegmentDelete);

            accelSegment = accelSegmentFactory.MakeFromTimeVelocity(3, 5, 0, 0, 3, 0.5);

            profile.appendSegment(accelSegment);

            accelSegment = accelSegmentFactory.MakeFromTimeVelocity(5, 8, 0, 0, 0, 0.5);

            profile.appendSegment(accelSegment);

            profile.deleteSegment(accelSegmentDelete.id);

            var segments = profile.getAllSegments();

            expect(segments.length).toBe(3);

            var seg0 = segments[0];
            expect(seg0.initialTime).toBe(0);
            expect(seg0.finalTime).toBe(2);
            expect(seg0.EvaluatePositionAt(0.5)).toBeCloseTo(0.277777, 4);

            //also, the profile needs to be valid
            expect(ph.validateBasicSegments(profile.getAllBasicSegments())).toBe(true);
        });

        it('should correctly delete an accel segment the first segment', function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var accelSegmentDelete = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 10, 0.5);

            profile.appendSegment(accelSegmentDelete);

            var accelSegment = accelSegmentFactory.MakeFromTimeVelocity(2, 3, 0, 0, 7.5, 0.5);

            profile.appendSegment(accelSegment);

            accelSegment = accelSegmentFactory.MakeFromTimeVelocity(3, 5, 0, 0, 3, 0.5);

            profile.appendSegment(accelSegment);

            accelSegment = accelSegmentFactory.MakeFromTimeVelocity(5, 8, 0, 0, 0, 0.5);

            profile.appendSegment(accelSegment);

            profile.deleteSegment(accelSegmentDelete.id);

            var segments = profile.getAllSegments();

            expect(segments.length).toBe(3);

            var seg0 = segments[0];
            expect(seg0.initialTime).toBe(0);
            expect(seg0.finalTime).toBe(1);
            expect(seg0.EvaluatePositionAt(0.5)).toBeCloseTo(0.72916, 4);

            //also, the profile needs to be valid
            expect(ph.validateBasicSegments(profile.getAllBasicSegments())).toBe(true);
        });

        it('should correctly find existing segments with exact matches', function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var accelSegment1 = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 10, 0.5);

            profile.appendSegment(accelSegment1);

            var accelSegment2 = accelSegmentFactory.MakeFromTimeVelocity(2, 4, 10, 10, 0, 0.5);

            profile.appendSegment(accelSegment2);

            var existing = profile.getExistingSegment(0);
            expect(existing.initialTime).toBe(0);

            existing = profile.getExistingSegment(2);
            expect(existing.initialTime).toBe(2);

        });

        it('should not find any segments before and after the existing profile segment range', function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var accelSegment1 = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 10, 0.5);

            profile.appendSegment(accelSegment1);

            var accelSegment2 = accelSegmentFactory.MakeFromTimeVelocity(2, 4, 10, 10, 0, 0.5);

            profile.appendSegment(accelSegment2);

            var existing = profile.getExistingSegment(1);
            expect(existing).toBe(null);

            existing = profile.getExistingSegment(3);
            expect(existing).toBe(null);
        });

        it('should find existing segments, even if initialTime is off by some number less than epsilon', function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var accelSegment1 = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 10, 0.5);

            profile.appendSegment(accelSegment1);

            var accelSegment2 = accelSegmentFactory.MakeFromTimeVelocity(2, 4, 10, 10, 0, 0.5);

            profile.appendSegment(accelSegment2);

            var existing = profile.getExistingSegment(0 - fastMath.epsilon / 2);
            expect(existing).not.toBe(null);
            expect(existing.initialTime).toBe(accelSegment1.initialTime);

            existing = profile.getExistingSegment(2 + fastMath.epsilon / 2);
            expect(existing).toBe(accelSegment2);
        });

        it('should insert a segment in between two other segments', function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var accelSegment1 = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 10, 0.5);

            profile.appendSegment(accelSegment1);

            var accelSegment2 = accelSegmentFactory.MakeFromTimeVelocity(2, 4, 10, 10, 0, 0.5);

            profile.appendSegment(accelSegment2);

            var accelSegment3 = accelSegmentFactory.MakeFromTimeVelocity(2, 4, 10, 5, 0, 0.5);

            profile.insertSegment(accelSegment3, accelSegment2.id);

            //after inserting, there should be 3 segments total
            expect(profile.getAllSegments().length).toBe(3);

            var allBasicSegments = profile.getAllBasicSegments();

            //also, the profile needs to be valid
            expect(ph.validateBasicSegments(profile.getAllBasicSegments())).toBe(true);

        });

        it('should insert a segment before an existing first segment', function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var accelSegment1 = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 10, 0.5);

            profile.appendSegment(accelSegment1);

            var accelSegment2 = accelSegmentFactory.MakeFromTimeVelocity(0, 1, 10, 10, 0, 0.5);

            profile.insertSegment(accelSegment2, accelSegment1.id);

            //after inserting, there should be 3 segments total
            expect(profile.getAllSegments().length).toBe(2);

            var allBasicSegments = profile.getAllBasicSegments();

            //also, the profile needs to be valid
            expect(ph.validateBasicSegments(profile.getAllBasicSegments())).toBe(true);
        });

        it("should be able to find parent segment via its child segment id", function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var seg1 = motionProfileFactory.createAccelSegment("time-velocity", {
                t0: 0,
                tf: 2,
                p0: 0,
                v0: 0,
                vf: 5,
                jPct: 0.5,
                mode: "incremental"

            });

            profile.appendSegment(seg1);

            var allSegments = profile.getAllBasicSegments();

            var childSegment = allSegments[1];

            var parent = profile.findParentSegmentByChildId(childSegment.id);

            expect(parent).toBe(seg1);
        });

        it('appending a segment should match final conditions of the previous segment ', function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var accelSegment1 = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 5, 0.5);

            profile.appendSegment(accelSegment1);

            var accelSegment2 = accelSegmentFactory.MakeFromTimeVelocity(2, 4, 10, 10, 3, 0.5);

            profile.appendSegment(accelSegment2);

            var allBasicSegments = profile.getAllBasicSegments();

            //also, the profile needs to be valid
            expect(ph.validateBasicSegments(profile.getAllBasicSegments())).toBe(true);
        });

        it("should be able to find parent segment via its child segment id", function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var seg1 = motionProfileFactory.createAccelSegment("time-velocity", {
                t0: 0,
                tf: 2,
                p0: 0,
                v0: 0,
                vf: 5,
                jPct: 0.5,
                mode: "incremental"

            });

            profile.appendSegment(seg1);



            var allSegments = profile.getAllBasicSegments();

            var childSegment = allSegments[1];

            var parent = profile.findParentSegmentByChildId(childSegment.id);

            expect(parent).toBe(seg1);



        });


        it('it should append incremental segment after absolute segment and correctly evalute final values ', function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var accelSegment1 = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 5, 0.5, "absolute");

            profile.appendSegment(accelSegment1);

            var accelSegment2 = accelSegmentFactory.MakeFromTimeVelocity(4, 6, 10, 10, 3, 0.5, "incremental");

            profile.appendSegment(accelSegment2);


            var allBasicSegments = profile.getAllSegments();

            //also, the profile needs to be valid
            expect(allBasicSegments[1].finalTime).toBe(4);


        });
        it("should be able to create segments via motionProfile accel segment function", function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var seg1 = motionProfileFactory.createAccelSegment("time-velocity", {
                t0: 0,
                tf: 2,
                p0: 0,
                v0: 0,
                vf: 5,
                jPct: 0.5,
                mode: "incremental"
            });

            profile.appendSegment(seg1);

            var allSegments = profile.getAllBasicSegments();
            expect(allSegments.length).toBe(3);
        });

        it("should be able to modify final position for AccelSegmentTimeDistance segment ", function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var seg1 = motionProfileFactory.createAccelSegment("time-distance", {
                t0: 0,
                tf: 2,
                p0: 0,
                v0: 0,
                pf: 5,
                jPct: 0.5,
                mode: "incremental"

            });

            profile.appendSegment(seg1);

            var sameSeg = profile.getAllSegments()[0];

            //we should get back the same segment that we just created
            expect(sameSeg).toBe(seg1);

            sameSeg.modifySegmentValues({
                distance: 2.5
            }, {
                position: 0,
                velocity: 0
            });

            var finalValues = sameSeg.getFinalValues();

            expect(finalValues.length).toBe(4);

            var finalPos = finalValues[3];
            var finalVel = finalValues[2];

            expect(finalPos).toBe(2.5);
            expect(finalVel).toBe(2.5);
        });

        it("should be able to modify final time for AccelSegmentTimeDistance segment ", function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var seg1 = motionProfileFactory.createAccelSegment("time-distance", {
                t0: 0,
                tf: 2,
                p0: 0,
                v0: 0,
                pf: 5,
                jPct: 0.5,
                mode: "incremental"
            });

            profile.appendSegment(seg1);

            var sameSeg = profile.getAllSegments()[0];

            //we should get back the same segment that we just created
            expect(sameSeg).toBe(seg1);

            sameSeg.modifySegmentValues({
                duration: 1
            }, {
                position: 0,
                velocity: 0
            });

            var finalValues = sameSeg.getFinalValues();

            expect(finalValues.length).toBe(4);

            var finalPos = finalValues[3];
            var finalVel = finalValues[2];

            expect(finalPos).toBe(5);
            expect(finalVel).toBe(10);
        });

        it("should be able to modify final time, final position and jerk for AccelSegmentTimeDistance segment ", function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var seg1 = motionProfileFactory.createAccelSegment("time-distance", {
                t0: 0,
                tf: 2,
                p0: 0,
                v0: 0,
                pf: 5,
                jPct: 0.5,
                mode: "incremental"
            });

            profile.appendSegment(seg1);

            var sameSeg = profile.getAllSegments()[0];

            //we should get back the same segment that we just created
            expect(sameSeg).toBe(seg1);

            sameSeg.modifySegmentValues({
                duration: 1,
                distance: 1.5,
                jerkPercent: 0.25
            }, {
                position: 0,
                velocity: 0
            });

            var finalValues = sameSeg.getFinalValues();

            expect(finalValues.length).toBe(4);

            var finalPos = finalValues[3];
            var finalVel = finalValues[2];

            expect(finalPos).toBe(1.5);
            expect(finalVel).toBe(3);
        });

        it("should be able to modify final velocity for AccelSegmentTimeVelocity segment ", function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var seg1 = motionProfileFactory.createAccelSegment("time-velocity", {
                t0: 0,
                tf: 2,
                p0: 0,
                v0: 0,
                vf: 5,
                jPct: 0.5,
                mode: "incremental"
            });

            profile.appendSegment(seg1);

            var sameSeg = profile.getAllSegments()[0];

            //we should get back the same segment that we just created
            expect(sameSeg).toBe(seg1);

            sameSeg.modifySegmentValues({
                finalVelocity: 2.5
            }, {
                position: 0,
                velocity: 0
            });

            var finalValues = sameSeg.getFinalValues();

            expect(finalValues.length).toBe(4);

            var finalPos = finalValues[3];
            var finalVel = finalValues[2];

            expect(finalPos).toBe(2.5);
            expect(finalVel).toBe(2.5);
        });

        it("should be able to modify final velocity for AccelSegmentTimeVelocity segment using motionProfile function", function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var seg1 = motionProfileFactory.createAccelSegment("time-velocity", {
                t0: 0,
                tf: 2,
                p0: 0,
                v0: 0,
                vf: 5,
                jPct: 0.5,
                mode: "incremental"
            });

            profile.appendSegment(seg1);

            var sameSeg = profile.getAllSegments()[0];

            //we should get back the same segment that we just created
            expect(sameSeg).toBe(seg1);

            profile.modifySegmentValues(seg1.id, {
                finalVelocity: 2.5
            }, {
                position: 0,
                velocity: 0
            });

            var finalValues = sameSeg.getFinalValues();

            expect(finalValues.length).toBe(4);

            var finalPos = finalValues[3];
            var finalVel = finalValues[2];

            expect(finalPos).toBe(2.5);
            expect(finalVel).toBe(2.5);
        });

        it("should be able to modify final velocity, duration and jerk for AccelSegmentTimeVelocity segment ", function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var seg1 = motionProfileFactory.createAccelSegment("time-velocity", {
                t0: 0,
                tf: 2,
                p0: 0,
                v0: 0,
                vf: 5,
                jPct: 0.5,
                mode: "incremental"
            });

            profile.appendSegment(seg1);

            var sameSeg = profile.getAllSegments()[0];

            //we should get back the same segment that we just created
            expect(sameSeg).toBe(seg1);

            sameSeg.modifySegmentValues({
                finalVelocity: 2.5,
                duration: 1.2,
                jerkPercent: 0.25
            }, {
                position: 0,
                velocity: 0
            });

            var finalValues = sameSeg.getFinalValues();

            expect(finalValues.length).toBe(4);

            var finalPos = finalValues[3];
            var finalVel = finalValues[2];

            expect(finalPos).toBeCloseTo(1.5, 0.8);
            expect(finalVel).toBe(2.5);
        });

        it('should be able to undo appending a segment ', function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var accelSegment1 = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 5, 0.5);

            profile.appendSegment(accelSegment1);

            var accelSegment2 = accelSegmentFactory.MakeFromTimeVelocity(2, 4, 10, 10, 3, 0.5);

            profile.appendSegment(accelSegment2);

            var allSegments = profile.getAllSegments();
            expect(allSegments.length).toBe(2);

            //perform the undo operation
            profile.undo();

            allSegments = profile.getAllSegments();
            expect(allSegments.length).toBe(1);
            expect(allSegments[0]).toBe(accelSegment1);

            profile.undo();
            allSegments = profile.getAllSegments();
            expect(allSegments.length).toBe(0);
        });

        it('should be able to undo and redo appending segments ', function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var accelSegment1 = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 5, 0.5);

            profile.appendSegment(accelSegment1);

            var accelSegment2 = accelSegmentFactory.MakeFromTimeVelocity(2, 4, 10, 10, 3, 0.5);

            profile.appendSegment(accelSegment2);

            var allSegments = profile.getAllSegments();
            expect(allSegments.length).toBe(2);

            //perform the undo operation
            profile.undo();

            allSegments = profile.getAllSegments();
            expect(allSegments.length).toBe(1);
            expect(allSegments[0]).toBe(accelSegment1);

            profile.undo();
            allSegments = profile.getAllSegments();
            expect(allSegments.length).toBe(0);


            profile.redo();
            allSegments = profile.getAllSegments();
            expect(allSegments.length).toBe(1);
            expect(allSegments[0]).toBe(accelSegment1);

            profile.redo();
            allSegments = profile.getAllSegments();
            expect(allSegments.length).toBe(2);
            expect(allSegments[0]).toBe(accelSegment1);
            expect(allSegments[1]).toBe(accelSegment2);
        });

        it('should be able to undo and redo deleting segments ', function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var accelSegment1 = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 5, 0.5);

            profile.appendSegment(accelSegment1);

            var accelSegment2 = accelSegmentFactory.MakeFromTimeVelocity(2, 4, 10, 10, 3, 0.5);

            profile.appendSegment(accelSegment2);

            var allSegments = profile.getAllSegments();
            expect(allSegments.length).toBe(2);

            profile.deleteSegment(accelSegment2.id);
            profile.deleteSegment(accelSegment1.id);

            expect(profile.getAllSegments().length).toBe(0);

            profile.undo();
            profile.undo();

            allSegments = profile.getAllSegments();
            expect(allSegments.length).toBe(2);
            expect(allSegments[0]).toBe(accelSegment1);
            expect(allSegments[1]).toBe(accelSegment2);

            profile.redo(); //redoing the second delete operation
            allSegments = profile.getAllSegments();
            expect(allSegments[0]).toBe(accelSegment1);

            profile.redo();
            //redoing the first delete operation, should have no segments
            allSegments = profile.getAllSegments();
            expect(allSegments.length).toBe(0);
        });

        it('should insert a segment in between two other segments, then undo and redo', function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var accelSegment1 = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 10, 0.5);

            profile.appendSegment(accelSegment1);

            var accelSegment2 = accelSegmentFactory.MakeFromTimeVelocity(2, 4, 10, 10, 0, 0.5);

            profile.appendSegment(accelSegment2);

            var accelSegment3 = accelSegmentFactory.MakeFromTimeVelocity(2, 4, 10, 5, 0, 0.5);

            profile.insertSegment(accelSegment3, accelSegment2.id);

            //undo the insert operation
            profile.undo();

            //after inserting, there should be 3 segments total
            expect(profile.getAllSegments().length).toBe(2);

            var allSegments = profile.getAllSegments();
            expect(allSegments.length).toBe(2);
            expect(allSegments[0]).toBe(accelSegment1);
            expect(allSegments[1]).toBe(accelSegment2);

            //redo the insert operation
            profile.redo();
            allSegments = profile.getAllSegments();
            expect(allSegments.length).toBe(3);
            expect(allSegments[0]).toBe(accelSegment1);
            expect(allSegments[1]).toBe(accelSegment3);
            expect(allSegments[2]).toBe(accelSegment2);
        });

        it("should be able to modify final position and then undo and redo it", function() {

            var profile = motionProfileFactory.createMotionProfile("rotary");

            var seg1 = motionProfileFactory.createAccelSegment("time-distance", {
                t0: 0,
                tf: 2,
                p0: 0,
                v0: 0,
                pf: 5,
                jPct: 0.5,
                mode: "incremental"
            });

            profile.appendSegment(seg1);

            var sameSeg = profile.getAllSegments()[0];

            //we should get back the same segment that we just created
            expect(sameSeg).toBe(seg1);

            profile.modifySegmentValues(sameSeg.id, {
                distance: 2.5
            }, {
                position: 0,
                velocity: 0
            });

            // make sure expected final values are still valid
            var finalValues = sameSeg.getFinalValues();

            expect(finalValues.length).toBe(4);

            var finalPos = finalValues[3];
            var finalVel = finalValues[2];

            expect(finalPos).toBe(2.5);
            expect(finalVel).toBe(2.5);

            //undo modify operation
            profile.undo();

            sameSeg = profile.getAllSegments()[0];
            finalValues = sameSeg.getFinalValues();
            finalPos = finalValues[3];

            //back to the original
            expect(finalPos).toBe(5);
        });

        it("should be able to add a load segment to the motion profile", function() {

        });

        it('should be able to append an index segment to an empty profile, then delete it', function() {
            var profile = motionProfileFactory.createMotionProfile('linear');

            //(t0, tf, p0, pf, v, velLimPos, velLimNeg, accJerk, decJerk, xSkew, ySkew, shape, mode) {
            var indexSeg = indexSegmentFactory.Make(0, 1.25048, 0, 0.154, 0, null, null, 0.2, 1, null, null, 'trapezoid', 'incremental');

            expect(indexSeg.getAllSegments().length).toBe(6);

            profile.appendSegment(indexSeg);

            var sameSeg = profile.getAllSegments()[0];

            expect(sameSeg).toBe(indexSeg);

            profile.deleteSegment(sameSeg.id);

            expect(profile.getAllSegments().length).toBe(0);

            profile.undo();

            expect(profile.getAllSegments().length).toBe(1);
            expect(profile.getAllSegments()[0]).toBe(indexSeg);

            profile.redo();

            expect(profile.getAllSegments().length).toBe(0);

            profile.undo();
            var sameSeg2 = profile.getAllSegments()[0];

            expect(indexSeg).toBe(sameSeg2);
        });

        it('should be able to insert an accel segment before an index segment', function() {
            var profile = motionProfileFactory.createMotionProfile('rotary');

            //(t0, tf, p0, pf, v, velLimPos, velLimNeg, accJerk, decJerk, xSkew, ySkew, shape, mode)
            var indexSeg = indexSegmentFactory.Make(0, 1.25048, 0, 0.154, 0, null, null, 0.2, 1, null, null, 'trapezoid', 'incremental');

            expect(indexSeg.getAllSegments().length).toBe(6);

            profile.appendSegment(indexSeg);

            var firstIndexSeg = profile.getAllSegments()[0];
            expect(firstIndexSeg.EvaluatePositionAt(0.47988481)).toBeCloseTo(0.0501486, 4);
            expect(firstIndexSeg.EvaluateVelocityAt(0.6)).toBeCloseTo(0.184729, 4);
            expect(firstIndexSeg.getAllSegments()[4].evaluateVelocityAt(0.992956)).toBeCloseTo(0.1307183, 4);
            expect(firstIndexSeg.EvaluateVelocityAt(0.992956)).toBeCloseTo(0.1307183, 4);

            expect(profile.getAllSegments().length).toBe(1);
            var accSeg = accelSegmentFactory.MakeFromTimeDistance(0, 1.57, 0, 0, 0.526, 0.4, 'incremental');
            profile.insertSegment(accSeg, indexSeg.id);
            expect(profile.segments.countSegments()).toBe(2);

            var allSegs = profile.getAllSegments();

            expect(allSegs.length).toBe(2);

            allSegs = profile.getAllSegments();

            expect(profile.segments.countSegments()).toBe(2);
            expect(allSegs[0].EvaluateVelocityAt(0.8)).toBeCloseTo(0.3430342, 4);
            expect(allSegs[1].EvaluateVelocityAt(2.206)).toBeCloseTo(-0.15030278, 4);
        });

        it('insert index segment between two accel segments (incremental and absolute)', function () {
            var profile = motionProfileFactory.createMotionProfile('linear');
            // (t0, tf, p0, v0, vf, jPct, mode, loads)
            var accSeg1 = profile.appendSegment(
                accelSegmentFactory.MakeFromTimeVelocity(
                    0,
                    1,
                    0,
                    0,
                    77,
                    0.12,
                    'incremental'));

            // run tests on accSeg 1
            expect(accSeg1.EvaluatePositionAt(0.74)).toBeCloseTo(20.6589, 4);
            expect(accSeg1.EvaluatePositionAt(accSeg1.finalTime)).toBe(38.5);
            expect(accSeg1.EvaluatePositionAt(1)).toBe(38.5);
            expect(accSeg1.EvaluatePositionAt(0.6)).toBeCloseTo(13.3193617, 4);

            // (t0, tf, p0, v0, pf, jPct, mode, loads)
            var accSeg2 = profile.appendSegment(
                accelSegmentFactory.MakeFromTimeDistance(
                    accSeg1.finalTime, // t0
                    13, // tf
                    accSeg1.EvaluatePositionAt(accSeg1.finalTime), // p0
                    accSeg1.EvaluateVelocityAt(accSeg1.finalTime), // v0
                    58.5, // pf
                    0.5, // jPct
                    'absolute')); // mode

            // rerun exact same tests on accSeg1
            expect(accSeg1.EvaluatePositionAt(0.74)).toBeCloseTo(20.6589, 4);
            expect(accSeg1.EvaluatePositionAt(accSeg1.finalTime)).toBe(38.5);
            expect(accSeg1.EvaluatePositionAt(1)).toBe(38.5);
            expect(accSeg1.EvaluatePositionAt(0.6)).toBeCloseTo(13.3193617, 4);

            // run tests on accSeg2
            expect(accSeg2.finalTime).toBe(13);
            expect(accSeg2.EvaluatePositionAt(accSeg2.finalTime)).toBeCloseTo(58.5, 4);
            expect(accSeg2.EvaluatePositionAt(7.0995575)).toBeCloseTo(324.80518657, 4);

            // console.log(accSeg1.getFinalValues());

            // (t0, tf, p0, pf, v, velLimPos, velLimNeg, accJerk, decJerk, xSkew, ySkew, shape, mode)
            var indexSeg1 = profile.insertSegment(
                indexSegmentFactory.Make(
                    accSeg1.finalTime, // t0
                    accSeg1.finalTime + 1.67, // tf
                    accSeg1.EvaluatePositionAt(accSeg1.finalTime), // p0
                    accSeg1.EvaluatePositionAt(accSeg1.finalTime) + 12, // pf
                    accSeg1.EvaluateVelocityAt(accSeg1.finalTime), // v
                    null, // velLimPos
                    null, // velLimNeg
                    0.1, // accJerk
                    0.5, // decJerk
                    0.3, // xSkew
                    0.27, // ySkew
                    'trapezoid', // shape
                    'incremental'), // mode
                accSeg2.id);

            // get segments after inserting indexSegment
            var accSeg1B = profile.getAllSegments()[0];
            var indexSeg1B = profile.getAllSegments()[1];
            var accSeg2B = profile.getAllSegments()[2];

            // index seg start and end time
            expect(indexSeg1B.initialTime).toBe(1);
            expect(indexSeg1B.finalTime).toBe(2.67);

            // index seg start, end, and middle position
            expect(indexSeg1B.EvaluatePositionAt(1)).toBe(38.5);
            expect(indexSeg1B.EvaluatePositionAt(1.5)).toBeCloseTo(53.12942, 4);
            expect(indexSeg1B.EvaluatePositionAt(2.67)).toBeCloseTo(50.5, 4);

            // index seg start, middle, and end velocity
            expect(indexSeg1B.EvaluateVelocityAt(1)).toBeCloseTo(77, 10);
            expect(indexSeg1B.EvaluateVelocityAt(1.5)).toBeCloseTo(-11.66425, 4);
            expect(indexSeg1B.EvaluateVelocityAt(2.67)).toBeCloseTo(77, 10);

            // index seg early, middle, and late acceleration
            expect(indexSeg1B.EvaluateAccelerationAt(1.2)).toBeCloseTo(-202.211, 3);
            expect(indexSeg1B.EvaluateAccelerationAt(1.85)).toBe(0);
            expect(indexSeg1B.EvaluateAccelerationAt(2.55)).toBeCloseTo(475.678, 3);

            // accSeg2 intial and final time
            expect(accSeg2B.initialTime).toBe(2.67);
            expect(accSeg2B.finalTime).toBe(13);

            // accSeg2 start, middle, and end position
            expect(accSeg2B.EvaluatePositionAt(2.67)).toBeCloseTo(50.5, 4);
            expect(accSeg2B.EvaluatePositionAt(8.001514035)).toBeCloseTo(294.953658, 4);
            expect(accSeg2B.EvaluatePositionAt(13)).toBeCloseTo(58.5, 4); // this value is wrong

            // accSeg2 start and end velocity
            expect(accSeg2B.EvaluateVelocityAt(2.67)).toBeCloseTo(77, 10);
            expect(accSeg2B.EvaluateVelocityAt(8)).toBeCloseTo(-2.4723373, 4);
            expect(accSeg2B.EvaluateVelocityAt(13)).toBeCloseTo(-75.4511, 4); // this value is wrong

            expect(accSeg2B.EvaluateAccelerationAt(8)).toBeCloseTo(-19.6775, 4);


            // expect(indexSeg.finalTime).toBe(2.67);
            // expect(indexSeg.initialTime).toBe(accSeg1.finalTime);
            // expect(indexSeg.EvaluatePositionAt(indexSeg.finalTime)).toBeCloseTo(50.5);

            // expect(indexSeg.EvaluatePositionAt(indexSeg.initialTime)).toBe(38.5);

            // expect(accSeg2.initialTime).toBe(2.67);
            // expect(accSeg2.finalTime).toBe(13);
            // expect(accSeg2.EvaluatePositionAt(accSeg2.initialTime)).toBeCloseTo(50.5, 4);
            // expect(accSeg2.EvaluatePositionAt(accSeg2.finalTime)).toBeCloseTo(124, 4);
            // expect(accSeg2.segmentData.jerkPercent).toBe(0.5);
            // expect(accSeg2.EvaluatePositionAt(8.8)).toBeCloseTo(274.64365, 4);
            // expect(accSeg2.EvaluateVelocityAt(8.8)).toBeCloseTo(-21.0651, 4);
        });
    });
});