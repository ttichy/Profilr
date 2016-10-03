"use strict";

define(["angularMocks",
    "components/profile/motionProfile",
    "components/segments/accelSegment",
    "components/util/fastMath"
], function() {



    describe('Unit: motionProfileFactory performance testing', function() {

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


            var TOTAL=20000;

        it('timing '+ TOTAL+'  profile operations', function() {



            var profile = motionProfileFactory.createMotionProfile("rotary");

            var initTime=new Date();

            for (var i = 0; i < TOTAL; i++) {

                var seg1 = motionProfileFactory.createAccelSegment("time-velocity", {
                    t0: i,
                    tf: i+1,
                    p0: 0,
                    v0: 0,
                    vf: 5+i,
                    jPct: 0.5,
                    mode: "incremental"

                });

                profile.appendSegment(seg1);

            }

            var insertDone = new Date();

            var insertSeconds = (insertDone-initTime)/1000;


            var allSegs = profile.getAllSegments();
            var getAllTime = new Date();

            var getAllSeconds=(getAllTime -insertDone)/1000;

            var first=allSegs[0];

            profile.deleteSegment(first.id);

            var delDoneTime= new Date();

            var deleteSeconds=(delDoneTime-getAllTime)/1000;


            console.log('Time to insert '+TOTAL+' segments ', insertSeconds);
            console.log('Time to get '+TOTAL+' segments' , getAllSeconds);
            console.log('Time to delete the first segment (recalculate the rest) in '+TOTAL+' segments' , deleteSeconds);










        });
    });
});