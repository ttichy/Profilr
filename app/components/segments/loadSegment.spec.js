"use strict";
define(["angularMocks", "components/segments/loadSegment"], function() {


  describe('Unit: loadSegment testing', function() {

    var loadSegmentFactory, motionProfileFactory;

    beforeEach(function() {
      module('myApp');

      inject(function(_LoadSegment_, _motionProfileFactory_) {
        loadSegmentFactory = _LoadSegment_;
        motionProfileFactory=_motionProfileFactory_;
      });
    });


    it('should directly create a constant load segment with load = 1.2', function() {

      var seg = loadSegmentFactory.createLoadSegment("FRICTION",0, 1, 1.2, 1.2);


      expect(seg).toBeDefined();
      expect(seg.evaluateLoadAt(0)).toBe(1.2);
      expect(seg.evaluateLoadAt(0.5)).toBe(1.2);
      expect(seg.evaluateLoadAt(1)).toBe(1.2);
    });


    it('should directly create a variable load segment starting with 3 and ending with 4', function() {

      var seg = loadSegmentFactory.createLoadSegment("FRICTION",2, 6, 3, 4);


      expect(seg).toBeDefined();
      expect(seg.evaluateLoadAt(2)).toBe(3);
      expect(seg.evaluateLoadAt(4.5)).toBe(3.625);
      expect(seg.evaluateLoadAt(6)).toBe(4);
    });


    it('MotionProfile object should create a constant load segment', function() {

      var profile = motionProfileFactory.createMotionProfile("rotary");

      var loadSeg1=profile.createLoadSegment("FRICTION",0,2,1,1);

      expect(loadSeg1.evaluateLoadAt(0)).toBe(1);
      expect(loadSeg1.evaluateLoadAt(2)).toBe(1);


    });

    it('MotionProfile object should create a constant load segment and add it to the profile', function() {

      var profile = motionProfileFactory.createMotionProfile("rotary");

      var loadSeg1=profile.createLoadSegment("FRICTION",0,2,1,1);

      profile.addLoadSegment(loadSeg1);


      var loadSegs = profile.getAllLoadSegments("FRICTION");

      expect(loadSegs.length).toBe(1);


      expect(loadSeg1.evaluateLoadAt(0)).toBe(1);
      expect(loadSeg1.evaluateLoadAt(2)).toBe(1);

    });    

    it('MotionProfile object should create and delete a load segment, with type specified', function() {

      var profile = motionProfileFactory.createMotionProfile("rotary");

      var loadSeg1=profile.createLoadSegment("FRICTION",0,2,1,1);

      profile.addLoadSegment(loadSeg1);


      var loadSegs = profile.getAllLoadSegments("FRICTION");

      expect(loadSegs.length).toBe(1);

      var deleted=profile.deleteLoadSegment(loadSeg1.id, "FRICTION");
      loadSegs = profile.getAllLoadSegments("FRICTION");

      expect(loadSegs.length).toBe(0);
      expect(deleted).toBe(loadSeg1);



    });  

    it('MotionProfile object should create and delete a load segment, without type specified', function() {

      var profile = motionProfileFactory.createMotionProfile("rotary");

      var loadSeg1=profile.createLoadSegment("FRICTION",0,2,1,1);

      profile.addLoadSegment(loadSeg1);


      var loadSegs = profile.getAllLoadSegments("FRICTION");

      expect(loadSegs.length).toBe(1);

      var deleted=profile.deleteLoadSegment(loadSeg1.id);
      loadSegs = profile.getAllLoadSegments("FRICTION");

      expect(loadSegs.length).toBe(0);
      expect(deleted).toBe(loadSeg1);



    });  


    it('should only be able to add one load segment per type', function() {

      var profile = motionProfileFactory.createMotionProfile("rotary");

      var loadSeg1=profile.createLoadSegment("FRICTION",0,2,1,1);

      profile.addLoadSegment(loadSeg1);

      var loadSeg2 = profile.createLoadSegment("INERTIA",2,3,1,2);

      profile.addLoadSegment(loadSeg2);

      var loadSegs = profile.getAllLoadSegments("INERTIA");
      expect(loadSegs.length).toBe(1);

      var loadSeg3=profile.createLoadSegment("FRICTION",3,4,1,1);



      expect(function() {profile.addLoadSegment(loadSeg3);}).toThrow(new Error("Currently, only one segment per type can be added"));



    });   

    // currently, only one load segment per type is supported.
    xit('should only be able to add multiple non-overlapping load segments', function() {

      var profile = motionProfileFactory.createMotionProfile("rotary");

      var loadSeg1=profile.createLoadSegment("FRICTION",0,2,1,1);

      profile.addLoadSegment(loadSeg1);

      var loadSeg2 = profile.createLoadSegment("INERTIA",2,3,1,2);

      profile.addLoadSegment(loadSeg2);

      var loadSegs = profile.getAllLoadSegments("INERTIA");
      expect(loadSegs.length).toBe(1);

      var loadSeg3=profile.createLoadSegment("FRICTION",3,4,1,1);

      profile.addLoadSegment(loadSeg3);

      loadSegs = profile.getAllLoadSegments("FRICTION");
      expect(loadSegs[0]).toBe(loadSeg1);
      expect(loadSegs[1]).toBe(loadSeg3);

      // now insert a segment between the existing 2
      var loadSeg4=profile.createLoadSegment("FRICTION",2,3,1,1);
      profile.addLoadSegment(loadSeg4);

      loadSegs = profile.getAllLoadSegments("FRICTION");
      expect(loadSegs[0]).toBe(loadSeg1);
      expect(loadSegs[1]).toBe(loadSeg3);
      expect(loadSegs[2]).toBe(loadSeg4);

    });  

    // currently, only one load segment per type is supported.
    xit('should throw when trying to add overlapping load segments', function() {

      var profile = motionProfileFactory.createMotionProfile("rotary");

      var loadSeg1=profile.createLoadSegment("FRICTION",1,2,1,1);
      var loadSeg2=profile.createLoadSegment("FRICTION",1.2,1.8,1);
      var loadSeg3=profile.createLoadSegment("FRICTION",0,1.1,1);
      var loadSeg4=profile.createLoadSegment("FRICTION",0,3,1);


      profile.addLoadSegment(loadSeg1);

      expect(function() {profile.addLoadSegment(loadSeg2);}).toThrowError("New segment overlaps an existing segment");
      expect(function() {profile.addLoadSegment(loadSeg3);}).toThrowError("New segment overlaps an existing segment");
      expect(function() {profile.addLoadSegment(loadSeg4);}).toThrowError("New segment overlaps an existing segment");


    });



    it('should only be able to modify a load segment', function() {

      var profile = motionProfileFactory.createMotionProfile("rotary");

      var loadSeg1=profile.createLoadSegment("FRICTION",0,2,1,1);

      profile.addLoadSegment(loadSeg1);

      var loadSegs = profile.getAllLoadSegments("FRICTION");

      //should be able to get the same segment back
      expect(loadSegs[0]).toBe(loadSeg1);

      var changedSegment = profile.createLoadSegment("FRICTION",0,2,2,2);
      profile.modifyLoadSegment(loadSeg1.id,changedSegment);

      loadSegs = profile.getAllLoadSegments("FRICTION");
      expect(loadSegs[0].evaluateLoadAt(2)).toBe(2);


    });      




  });

});