const fs = require('fs');
const util = require('util');
const csvParse = require('csv-parse');
const csvParsePromise = util.promisify(csvParse);

euclideanDistance = (userA, userB) => {
  let sim = 0;
  let n = 0;

  for (const rA of userA.ratings) {
    for (const rB of userB.ratings) {
      if (rA.MovieId == rB.MovieId) {
        sim += Math.pow(rA.Rating - rB.Rating, 2);
        n++;
      }
    }
  }

  // No ratings in common, return 0
  if (n === 0) {
    return 0;
  }

  // Calculate inverted score
  return 1 / (1 + sim);
};
getUserRatings = async () => {
  const users = await getUsers();
  const ratings = await getRatings();
  const userRatings = [];

  for (const user of users) {
    const userRatingsRow = [];
    for (const rating of ratings) {
      if (rating.UserId === user.UserId) {
        userRatingsRow.push(rating);
      }
    }
    userRatings.push({ ...user, ratings: userRatingsRow });
  }
  return userRatings;
};

getMovie = async movieId => {
  const movies = await getMovies();
  for (const movie of movies) {
    if (movieId === movie.MovieId) {
      return movie;
    }
  }
  return null;
};

getUser = async userId => {
  const userRatings = await getUserRatings();
  for (const userRating of userRatings) {
    if (userId === userRating.UserId) {
      return userRating;
    }
  }
  return null;
};

getUserRecommendations = async (userId, count) => {
  const userRatings = await getUserRatings();
  const currentUser = await getUser(userId);
  const comparedUsers = [];
  for (const userRating of userRatings) {
    if (currentUser && currentUser.UserId != userRating.UserId) {
      comparedUsers.push({
        ...userRating,
        // similarity: await euclideanDistance(currentUser, userRating),
        similarity: roundDecimals(
          await euclideanDistance(currentUser, userRating),
          4
        ),
      });
    }
  }
  comparedUsers.sort((b, a) => {
    if (a.similarity < b.similarity) return -1;
    if (a.similarity > b.similarity) return 1;
    return 0;
  });
  return {
    comparedUsers: comparedUsers.slice(0, count),
    ...currentUser,
    users: await getUsers(),
  };
};

getCompareUserScores = async (userId, count) => {
  const userRatings = await getUserRatings();
  const currentUser = await getUser(userId);
  // console.log(currentUser);
  const comparedUsers = [];
  for (const userRating of userRatings) {
    if (currentUser && currentUser.UserId != userRating.UserId) {
      comparedUsers.push({
        ...userRating,
        similarity: await euclideanDistance(currentUser, userRating),
        // similarity: roundDecimals(
        //   await euclideanDistance(currentUser, userRating),
        //   4
        // ),
      });
    }
  }
  comparedUsers.sort((b, a) => {
    if (a.similarity < b.similarity) return -1;
    if (a.similarity > b.similarity) return 1;
    return 0;
  });
  return { comparedUsers: comparedUsers.slice(0, count), ...currentUser };
};

roundDecimals = (number, dec) => {
  const decimal = '1' + '0'.repeat(dec);
  return Math.round(number * decimal) / decimal;
};

getWeightedMovieScores = async (userId, count) => {
  const comparedUserScores = await getCompareUserScores(userId, count);
  const weightedUserScores = [];
  const movies = await getMovies();
  const weightedRatings = [];
  const weightedMovieScores = [];

  for (const user of comparedUserScores.comparedUsers) {
    for (const rating of user.ratings) {
      const movie = await getMovie(rating.MovieId);
      weightedRatings.push({
        user: user.Name,
        sim: user.similarity,
        ...movie,
        weightedScore: rating.Rating * user.similarity,
        // weightedScore: roundDecimals(rating.Rating * user.similarity, 100),
        rating: rating.Rating,
      });
    }

    weightedUserScores.push(weightedRatings);
  }

  for (const movie of movies) {
    let weightedScoreSum = 0;
    let similaritySum = 0;
    for (const ws of weightedRatings) {
      if (movie.MovieId === ws.MovieId) {
        // console.log('ws', ws);
        weightedScoreSum += ws.weightedScore;
        similaritySum += ws.sim;
      }
    }
    weightedMovieScores.push({
      id: movie.MovieId,
      movie: movie.Title,
      weightedScoreSum: roundDecimals(weightedScoreSum, 4),
      similaritySum: roundDecimals(similaritySum, 4),
      similarityScore: roundDecimals(weightedScoreSum / similaritySum, 4),
      // weightedScoreSum: weightedScoreSum,
      // similaritySum: similaritySum,
      // similarityScore: weightedScoreSum / similaritySum,
    });
  }

  weightedMovieScores.sort((b, a) => {
    if (a.similarityScore < b.similarityScore) return -1;
    if (a.similarityScore > b.similarityScore) return 1;
    return 0;
  });

  return {
    user: { id: comparedUserScores.UserId, name: comparedUserScores.Name },
    weightedMovieScores: weightedMovieScores.slice(0, count),
    users: await getUsers(),
  };
  return weightedUserScores.slice(0, count);
};

getWeightedMovieScores2 = async (userId, count) => {
  const comparedUserScores = await getCompareUserScores(userId, count);
  const weightedUserScores = [];
  const movies = await getMovies();
  console.log('movies', movies);
  for (const user of comparedUserScores.comparedUsers) {
    const weightedRatings = [];
    for (const rating of user.ratings) {
      weightedRatings.push({
        ...rating,
        weightedScore: rating.Rating * user.similarity,
        // weightedScore: Math.round(rating.Rating * user.similarity * 100) / 100,
      });
    }
    console.table(weightedRatings);
    console.log();
    weightedUserScores.push({
      ...user,
      weightedRatings,
    });
  }

  fs.writeFile(
    'test.json',
    JSON.stringify(weightedUserScores, null, 2),
    function() {}
  );

  const weightedMovieScores = [];

  for (const movie of movies) {
  }

  return {
    user: { id: comparedUserScores.UserId, name: comparedUserScores.Name },
    weightedUserScores,
    users: await getUsers(),
  };
  return weightedUserScores;
};
getMovies = async () => {
  const data = await fs.promises.readFile(
    __dirname + '/../db/example/movies.csv',
    // __dirname + '/../db/movies.csv',
    'utf8',
    async function(err, csvData) {
      return csvData;
    }
  );
  return await csvParsePromise(data, {
    columns: true,
    delimiter: ';',
    quote: '',
    trim: true,
  });
};

getUsers = async () => {
  const data = await fs.promises.readFile(
    __dirname + '/../db/example/users.csv',
    // __dirname + '/../db/users.csv',
    'utf8',
    async function(err, csvData) {
      return csvData;
    }
  );
  return await csvParsePromise(data, {
    columns: true,
    delimiter: ';',
    quote: '',
    trim: true,
  });
};

getRatings = async () => {
  const data = await fs.promises.readFile(
    __dirname + '/../db/example/ratings.csv',
    // __dirname + '/../db/ratings.csv',
    'utf8',
    async function(err, csvData) {
      return csvData;
    }
  );
  return await csvParsePromise(data, {
    columns: true,
    delimiter: ';',
    quote: '',
    trim: true,
  });
};
getWeightedMovieScores(4);
module.exports = {
  euclideanDistance,
  getUserRatings,
  getMovies,
  getUsers,
  getRatings,
  getWeightedMovieScores,
  getCompareUserScores,
  getWeightedMovieScores2,
  getUserRecommendations,
};
