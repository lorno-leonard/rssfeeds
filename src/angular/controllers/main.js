angular.module('rssfeeds').controller('mainCtrl', [
  '$scope', '$http',

  function($scope, $http) {
    $scope.test = 'Angular Works!';
    $scope.limit = 100;
    $scope.offset = 0;
    $scope.feeds = [];

    // Functions
    $scope.load_feeds = function() {
      // Get Feeds
      $http({
          method: 'GET',
          url: '/feeds',
          params: {
            limit: $scope.limit,
            offset: $scope.feeds.length
          }
        })
        .then(
          function(response) {
            $scope.feeds = $scope.feeds.concat(response.data);
          },
          function(response) {
            // Error
          }
        );
    };

    $scope.is_liked = function(liked) {
      return liked ? 'disabled' : '';
    }

    $scope.like_feed = function(feed, $event) {
      var button = $event.target;

      $http({
          method: 'POST',
          url: '/feeds/' + feed.feedId + '/like'
        })
        .then(
          function(response) {
            $(button).addClass('disabled').prop('disabled', 'disabled');
          },
          function(response) {
            // Error
          }
        );
    };

    $scope.sort_feeds = function() {
      $scope.feeds = _.sortByOrder($scope.feeds, ['likes', 'createdAt'], ['desc', 'desc']);
    };

    // Socket
    var socket = io();
    socket.on('likes', function(response) {
      var feed = _.find($scope.feeds, function(feed) {
        return feed.feedId == response.feedId;
      });

      $scope.$apply(function () {
        // Set likes
        feed.likes = response.likes;
        feed.liked = true;

        // Sort Feeds
        $scope.sort_feeds();
      });
    });

    socket.on('newFeeds', function(response) {
      $scope.$apply(function () {
        // Add New Feeds
        $scope.feeds = $scope.feeds.concat(response);
        $scope.offset = $scope.feeds.length;

        // Sort Feeds
        $scope.sort_feeds();
      });
    });

    // Load Feeds
    $scope.load_feeds();
  }
]);
