'use strict';

/* Controllers */

var App = angular.module( 'myApp.controllers', [ 'ui.bootstrap' ] );

/**************************************************
        * Main Controller / index.html
**************************************************/

App.controller( 'MainCtrl', [ '$scope', '$http', '$routeParams', '$location',
  function ( $scope, $http, $routeParams, $location ) {

    $scope.billView = function(bill_id) {
      $location.path('/bills/' + bill_oid);
    }

    // loads politician: pic, name, bills, committee //
    politician();

    // temporarily here //
    //getContributions();

    $scope.viewSingleBill = function ( oid ) {

      $location.url( '/bill/' + oid );

    };

    

/**************************************************
                    * Helpers
**************************************************/


    /*******************************
      * politician picture & name
    *******************************/

    function politician() {

      $http({

        method  : 'GET',
        url     : 'http://localhost:3000/api/candidates'

      }).
      success( function ( data, status, headers, config ) {

        var Candidates    = data;
        var CurCandidate  = 0;

        // first politician //
        $scope.fullName   = Candidates[CurCandidate].full_name;
        $scope.firstName  = Candidates[CurCandidate].first_name;
        $scope.lastName   = Candidates[CurCandidate].last_name;
        $scope.party      = Candidates[CurCandidate].party;
        $scope.picture    = Candidates[CurCandidate].photo_url;
        $scope.forward    = forwardClick;
        $scope.back       = backwardClick;
        $scope.leg_id     = Candidates[CurCandidate].leg_id;

        getCommittee( function( committee ) {

            $scope.committees = committee;

        });

          getBills( function( bills ) {

            $scope.bills = bills;

          });

          getContributions( function( contributionData ) {

            $scope.pData = contributionData;
            $scope.lData = contributionData.contributedDate;

          });

        // right arrow  click //
        function forwardClick() {

          CurCandidate      = ( CurCandidate + 1 ) % Candidates.length;

          $scope.fullName   = Candidates[CurCandidate].full_name;
          $scope.firstName  = Candidates[CurCandidate].first_name;
          $scope.lastName   = Candidates[CurCandidate].last_name;
          $scope.party      = Candidates[CurCandidate].party;
          $scope.picture    = Candidates[CurCandidate].photo_url;
          $scope.leg_id     = Candidates[CurCandidate].leg_id;

          getCommittee( function( committee ) {

             $scope.committees = committee;

          });

          getBills( function( bills ) {

            $scope.bills = bills;

          });

            getContributions( function( contributionData ) {
            
              $scope.pData = contributionData;
              $scope.lData = contributionData.contributedDate;

            });

        }

        // left arrow click //
        function backwardClick() {

          ( CurCandidate === 0 )? CurCandidate = Candidates.length -1 : CurCandidate--;

          $scope.fullName   = Candidates[CurCandidate].full_name;
          $scope.firstName  = Candidates[CurCandidate].first_name;
          $scope.lastName   = Candidates[CurCandidate].last_name;
          $scope.party      = Candidates[CurCandidate].party;
          $scope.picture    = Candidates[CurCandidate].photo_url;
          $scope.leg_id     = Candidates[CurCandidate].leg_id;

          getCommittee( function( committee ) {
            
            $scope.committees = committee;

          });

          getBills( function( bills ) {

            $scope.bills = bills;

          });


          getContributions( function( contributionData ) {
          
            $scope.pData = contributionData;
            $scope.lData = contributionData.contributedDate;


          });

        }


      }).
      error( function ( data, status, headers, config ) {

        console.log('Error ' + status);

      });

    }// function politician

    /*******************************
      * politician's committees
    *******************************/

    function getCommittee( cb ) {

    var politicianCommittees   = [];


      $http({

        method   : 'GET',
        url      : 'http://localhost:3000/api/committees'

      }).
      success( function ( data, status, headers, config ) {

        for (var i = 0; i < data.length; i++) {

          for (var j = 0; j < data[i].members.length; j++) {

            if ( $scope.leg_id == data[i].members[j].leg_id ) {

              politicianCommittees.push( data[i].committee[0] );

            }


          }

          cb( politicianCommittees );

        }


      }).
      error( function ( data, status, headers, config ) {

        console.log('Error ' + status);
        cb([]);

      });

    }// function committee


    /*******************************
          * politician's bills
    *******************************/

    function getBills( cb ) {

      var billCollection = [];

      $http({

        method  : 'GET',
        url     : 'http://localhost:3000/api/bills'

      }).
      success( function ( data, status, headers, config ) {

        for (var i = 0; i < data.length; i++) {

          for (var j = 0; j < data[i].sponsors.length; j++) {

            if ( $scope.leg_id == data[i].sponsors[j].leg_id ) {

              billCollection.push({

                id    : data[i].bill_id,
                title : data[i].title,
                oid   : data[i]._id

              });

            }

          }

        }

        return cb( billCollection );

      }).
      error( function ( data, status, headers, config ) {

        console.log( 'Error ' + status );
        cb([]);

      });

    }// function getBills


    // All contributions made to a politician //
    function getContributions ( cb ) {
      //$scope.pData = {};
      var money                   = [];
      var contributionType        = [];
      var contributedDate         = [];

      $http({

        method  : 'GET',
        url     : 'http://localhost:3000/api/contributions'

      }).
      success( function ( data, status, headers, config ) {
        
        for ( var i = 0; i < data.length; i++ ) {

          if ( $scope.fullName == data[i].candidate_name ) {

            money.push( data[i].amount );
            contributionType.push( data[i].contributor_type );  
            contributedDate.push({'date': data[i].date, 'contributionmoney': data[i].amount});

          }

        }

        var contributionData  = { industrymoney : money, contributiontype : contributionType, contributedDate: contributedDate };

        return cb ( contributionData );

      }).
      error( function ( data, status, headers, config ) {

        console.log( 'Error ' + status );

      });

    }// function getContributions

    var bill_oid = $routeParams.oid;
  getSingleBill(bill_oid);

  function getSingleBill ( oid ) {

    $http({

      method  : 'GET',
      url     : 'http://localhost:3000/api/bill/' + oid

    }).
    success( function ( data, status, headers, config ) {
      
      $scope.singleBill = data;

    }).
    error( function ( data, status, headers, config ) {

      console.log( "error getting single bill data: " + data );
      console.log( 'Error ' + status );

    });

  } //getSingleBill


 $scope.enter = function () {
    $location.path('/candidates');
  }


  }

]);




App.controller('LandingController', function ($scope, $http, $location) {
  $scope.enter = function () {
    $location.path('/candidates');
  }
});

