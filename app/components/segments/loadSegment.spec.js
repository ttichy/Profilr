"use strict";
define(["angularMocks", "components/segments/loadSegment"], function() {


  describe('Unit: loadSegment testing', function() {

    var loadSegmentFactory;

    beforeEach(function() {
      module('myApp');

      inject(function(_LoadSegment_) {
        loadSegmentFactory = _LoadSegment_;
      });
    });


    it('should create a constant load segment with load = 1.2', function() {

      var seg = loadSegmentFactory.createLoadSegment("FRICTION",0, 1, 1.2, 1.2);


      expect(seg).toBeDefined();
      expect(seg.evaluateLoadAt(0)).toBe(1.2);
      expect(seg.evaluateLoadAt(0.5)).toBe(1.2);
      expect(seg.evaluateLoadAt(1)).toBe(1.2);
    });


    it('should create a variable load segment starting with 3 and ending with 4', function() {

      var seg = loadSegmentFactory.createLoadSegment("FRICTION",2, 6, 3, 4);


      expect(seg).toBeDefined();
      expect(seg.evaluateLoadAt(2)).toBe(3);
      expect(seg.evaluateLoadAt(4.5)).toBe(3.625);
      expect(seg.evaluateLoadAt(6)).toBe(4);
    });



  });

});