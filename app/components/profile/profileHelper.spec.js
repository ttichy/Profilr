"use strict";
define(["angularMocks","components/profile/profileHelper","components/profile/motionProfile"], function() {

  describe('Unit: profile helper functions-', function() {
    var polynomialFactory;
    var basicSegmentFactory;
    var accelSegmentFactory;
    var fm, ph, motionProfileFactory;

    beforeEach(function() {
      module('myApp');

      inject(function(_FastMath_) {
        fm = _FastMath_;
      });

      inject(function(_ProfileHelper_) {
        ph = _ProfileHelper_;
      });

      inject(function(_basicSegmentFactory_) {
        basicSegmentFactory = _basicSegmentFactory_;
      });

      inject(function(_motionProfileFactory_, _AccelSegment_) {
        motionProfileFactory = _motionProfileFactory_;
        accelSegmentFactory = _AccelSegment_;
      });
    });



    it('profile helper should validate basic segments in a valid profile', function() {
      var profile = motionProfileFactory.createMotionProfile("rotary");

      var accelSegment = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 10, 0.5);

      profile.appendSegment(accelSegment);

      accelSegment = accelSegmentFactory.MakeFromTimeVelocity(2, 4, 10, 10, 0, 0.5);

      profile.appendSegment(accelSegment);

      ph.validateBasicSegments(profile.getAllBasicSegments());


    });



  });


});