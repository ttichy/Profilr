    "use strict";

    define(["angularMocks",
        "components/profile/motionProfile",
        "components/segments/accelSegment",
        "components/util/fastMath"
    ], function() {



        describe('Unit: motionProfileFactory testing', function() {

            var motionProfileFactory;
            var accelSegmentFactory, fastMath, ph;

            beforeEach(function() {
                module('myApp');

                inject(function(_motionProfileFactory_, _AccelSegment_, _FastMath_) {
                    motionProfileFactory = _motionProfileFactory_;
                    accelSegmentFactory = _AccelSegment_;
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

                profile.modifySegmentValues(seg1.id,{
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
                    jerkPercent:0.25
                }, {
                    position: 0,
                    velocity: 0
                });

                var finalValues = sameSeg.getFinalValues();

                expect(finalValues.length).toBe(4);

                var finalPos = finalValues[3];
                var finalVel = finalValues[2];

                expect(finalPos).toBeCloseTo(1.5,0.8);
                expect(finalVel).toBe(2.5);




            });            


        });


    });