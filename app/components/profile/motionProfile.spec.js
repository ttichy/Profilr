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


            xit('should add 2 accel segments to the profile and have 6 basic segments total', function() {

                var profile = motionProfileFactory.createMotionProfile("rotary");

                var accelSegment = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 10, 0.5);

                profile.PutSegment(accelSegment);

                accelSegment = accelSegmentFactory.MakeFromTimeVelocity(2, 4, 10, 10, 0, 0.5);

                profile.PutSegment(accelSegment);
                expect(profile.getAllBasicSegments().length).toBe(6);


                var segments = profile.getAllBasicSegments();
                var seg0 = segments[0];
                expect(seg0.initialTime).toBe(0);
                expect(seg0.finalTime).toBe(0.5);
                expect(seg0.EvaluatePositionAt(0.5)).toBeCloseTo(0.277777, 4);

                var seg1 = segments[1];
                expect(seg1.initialTime).toBe(0.5);
                expect(seg1.finalTime).toBe(1.5);
                expect(seg1.EvaluatePositionAt(1.5)).toBeCloseTo(5.277777, 4);

                var seg2 = segments[2];
                expect(seg2.initialTime).toBe(1.5);
                expect(seg2.finalTime).toBe(2);
                expect(seg2.EvaluatePositionAt(2)).toBe(10);


                var seg5 = segments[5];
                expect(seg5.initialTime).toBe(3.5);
                expect(seg5.finalTime).toBe(4);
                expect(seg5.EvaluatePositionAt(4)).toBe(20);


            });


            xit('should correctly place an accel segment within another accel segment, slicing the existing segment correctly', function() {

                var profile = motionProfileFactory.createMotionProfile("rotary");

                var accelSegment = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 10, 0.5);

                profile.PutSegment(accelSegment);

                var segments = profile.getAllBasicSegments();


                accelSegment = accelSegmentFactory.MakeFromTimeVelocity(0, 1, 0, 0, 7.5, 0.5);

                profile.PutSegment(accelSegment);
                expect(profile.getAllBasicSegments().length).toBe(6);

                segments = profile.getAllBasicSegments();

                var seg1 = segments[0];
                expect(seg1.initialTime).toBe(0);
                expect(seg1.finalTime).toBe(0.25);
                expect(seg1.EvaluatePositionAt(0)).toBe(0);
                expect(seg1.EvaluatePositionAt(0.25)).toBeCloseTo(0.104166666, 5);
                expect(seg1.EvaluateVelocityAt(0.25)).toBeCloseTo(1.25, 3);
                expect(seg1.EvaluateAccelerationAt(0.25)).toBe(10);


                var seg2 = segments[1];

                //at initial time
                expect(seg2.initialTime).toBe(0.25);
                expect(seg2.finalTime).toBe(0.75);
                expect(seg2.EvaluatePositionAt(0.25)).toBeCloseTo(0.104166666, 5);
                expect(seg2.EvaluateVelocityAt(0.25)).toBeCloseTo(1.25, 3);
                expect(seg2.EvaluateAccelerationAt(0.25)).toBe(10);

                //at final time
                expect(seg2.EvaluatePositionAt(0.75)).toBeCloseTo(1.9791666666, 5);
                expect(seg2.EvaluateVelocityAt(0.75)).toBeCloseTo(6.25, 3);
                expect(seg2.EvaluateAccelerationAt(0.75)).toBe(10);


                var seg3 = segments[2];
                //at initial time
                expect(seg3.initialTime).toBe(0.75);
                expect(seg3.finalTime).toBe(1.0);
                expect(seg3.EvaluatePositionAt(0.75)).toBeCloseTo(1.9791666666, 5);
                expect(seg3.EvaluateVelocityAt(0.75)).toBeCloseTo(6.25, 3);
                expect(seg3.EvaluateAccelerationAt(0.75)).toBe(10);

                //at final time
                expect(seg3.EvaluatePositionAt(1.0)).toBeCloseTo(3.75, 5);
                expect(seg3.EvaluateVelocityAt(1.0)).toBeCloseTo(7.5, 3);
                expect(seg3.EvaluateAccelerationAt(1.0)).toBe(0);



                var seg4 = segments[3];
                //at initial time
                expect(seg4.initialTime).toBe(1.0);
                expect(seg4.finalTime).toBe(1.25);
                expect(seg4.EvaluatePositionAt(1.0)).toBeCloseTo(3.75, 5);
                expect(seg4.EvaluateVelocityAt(1.0)).toBeCloseTo(7.5, 3);
                expect(seg4.EvaluateAccelerationAt(1.0)).toBe(0);

                //at final time
                expect(seg4.EvaluatePositionAt(1.25)).toBeCloseTo(5.65972222, 5);
                expect(seg4.EvaluateVelocityAt(1.25)).toBeCloseTo(7.9166666666, 3);
                expect(seg4.EvaluateAccelerationAt(1.25)).toBeCloseTo(3.33333, 3);



                var seg5 = segments[4];
                //at initial time
                expect(seg5.initialTime).toBe(1.25);
                expect(seg5.finalTime).toBe(1.75);
                expect(seg5.EvaluatePositionAt(1.25)).toBeCloseTo(5.65972222, 5);
                expect(seg5.EvaluateVelocityAt(1.25)).toBeCloseTo(7.9166666666, 3);
                expect(seg5.EvaluateAccelerationAt(1.25)).toBeCloseTo(3.33333, 3);

                //at final time
                expect(seg5.EvaluatePositionAt(1.75)).toBeCloseTo(10.03472222222, 5);
                expect(seg5.EvaluateVelocityAt(1.75)).toBeCloseTo(9.58333333333, 3);
                expect(seg5.EvaluateAccelerationAt(1.75)).toBeCloseTo(3.33333, 3);


                var seg6 = segments[5];
                //at initial time
                expect(seg6.initialTime).toBe(1.75);
                expect(seg6.finalTime).toBe(2.0);
                expect(seg6.EvaluatePositionAt(1.75)).toBeCloseTo(10.03472222222, 5);
                expect(seg6.EvaluateVelocityAt(1.75)).toBeCloseTo(9.58333333333, 3);
                expect(seg6.EvaluateAccelerationAt(1.75)).toBeCloseTo(3.33333, 3);

                //at final time
                expect(seg6.EvaluatePositionAt(2.0)).toBeCloseTo(12.5, 5);
                expect(seg6.EvaluateVelocityAt(2.0)).toBeCloseTo(10, 3);
                expect(seg6.EvaluateAccelerationAt(2.0)).toBeCloseTo(0, 3);

                expect(profile.SegmentKeys.length).toBe(2);

                expect(profile.SegmentKeys[0]).toBe(0);
                expect(profile.SegmentKeys[1]).toBe(1.0);

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



        });


    });