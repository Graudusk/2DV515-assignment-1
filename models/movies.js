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
    user: { ...currentUser },
    users: await getUsers(),
  };
};

getCompareUserScores = async (userId, count) => {
  const userRatings = await getUserRatings();
  const currentUser = await getUser(userId);
  const comparedUsers = [];

  for (const userRating of userRatings) {
    if (currentUser && currentUser.UserId != userRating.UserId) {
      comparedUsers.push({
        ...userRating,
        similarity: await euclideanDistance(currentUser, userRating),
      });
    }
  }
  comparedUsers.sort((b, a) => {
    if (a.similarity < b.similarity) return -1;
    if (a.similarity > b.similarity) return 1;
    return 0;
  });
  return { comparedUsers: comparedUsers, ...currentUser };
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
      if (userId != rating.UserId) {
        const movie = await getMovie(rating.MovieId);
        weightedRatings.push({
          user: user.Name,
          userId: user.UserId,
          sim: user.similarity,
          ...movie,
          weightedScore: rating.Rating * user.similarity,
          rating: rating.Rating,
        });
      }
    }

    weightedUserScores.push(weightedRatings);
  }

  for (const movie of movies) {
    let weightedScoreSum = 0;
    let similaritySum = 0;
    for (const ws of weightedRatings) {
      if (movie.MovieId === ws.MovieId && userId != ws.userId) {
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
    });
  }

  const filteredWeightedMovieScores = comparedUserScores.ratings
    ? weightedMovieScores.filter(
        ({ id }) =>
          !comparedUserScores.ratings.map(({ MovieId }) => MovieId).includes(id)
      )
    : [];
  return {
    user: { UserId: comparedUserScores.UserId, name: comparedUserScores.Name },
    weightedMovieScores: filteredWeightedMovieScores
      .sort((b, a) => {
        if (a.similarityScore < b.similarityScore) return -1;
        if (a.similarityScore > b.similarityScore) return 1;
        return 0;
      })
      .slice(0, count),
    users: await getUsers(),
  };
};

getMovies = async () => {
  const data = await fs.promises.readFile(
    // __dirname + '/../db/example/movies.csv',
    __dirname + '/../db/movies.csv',
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
    // __dirname + '/../db/example/users.csv',
    __dirname + '/../db/users.csv',
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
    // __dirname + '/../db/example/ratings.csv',
    __dirname + '/../db/ratings.csv',
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
module.exports = {
  getUserRatings,
  getMovies,
  getUsers,
  getRatings,
  getWeightedMovieScores,
  getCompareUserScores,
  getUserRecommendations,
};
