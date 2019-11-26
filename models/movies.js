const fs = require('fs');
const util = require('util');
const csvParse = require('csv-parse');
const csvParsePromise = util.promisify(csvParse);
const dbDir = __dirname + '/../db/example/';
// __dirname + '/../db/users.csv',

pearson = (userA, userB) => {
  let sum1 = 0;
  let sum2 = 0;
  let sum1sq = 0;
  let sum2sq = 0;
  let pSum = 0;
  let n = 0;

  for (const rA of userA.ratings) {
    for (const rB of userB.ratings) {
      if (rA.MovieId == rB.MovieId) {
        sum1 += parseFloat(rA.Rating);
        sum2 += parseFloat(rB.Rating);

        sum1sq += Math.pow(parseFloat(rA.Rating), 2);
        sum2sq += Math.pow(parseFloat(rB.Rating), 2);
        pSum += parseFloat(rA.Rating) * parseFloat(rB.Rating);
        n++;
      }
    }
  }

  // No ratings in common, return 0
  if (n === 0) {
    return 0;
  }
  const sum2div = sum2 / n;
  const num = pSum - (sum1 * sum2) / n;
  const den = Math.sqrt(
    (sum1sq - Math.pow(sum1, 2) / n) * (sum2sq - Math.pow(sum2, 2) / n)
  );
  return num / den;
};

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

getUserRecommendations = async ({ user, count, similarity }) => {
  const userRatings = await getUserRatings();
  const currentUser = await getUser(user);
  const comparedUsers = [];
  for (const userRating of userRatings) {
    if (currentUser && currentUser.UserId != userRating.UserId) {
      comparedUsers.push({
        ...userRating,
        similarity: roundDecimals(
          similarity === 'pearson'
            ? await pearson(currentUser, userRating)
            : await euclideanDistance(currentUser, userRating),
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

getCompareUserScores = async (userId, count, similarity) => {
  const userRatings = await getUserRatings();
  const currentUser = await getUser(userId);
  const comparedUsers = [];

  for (const userRating of userRatings) {
    if (currentUser && currentUser.UserId != userRating.UserId) {
      comparedUsers.push({
        ...userRating,
        similarity: roundDecimals(
          similarity === 'pearson'
            ? await pearson(currentUser, userRating)
            : await euclideanDistance(currentUser, userRating),
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
  return { comparedUsers: comparedUsers, ...currentUser };
};

roundDecimals = (number, dec) => {
  const decimal = '1' + '0'.repeat(dec);
  return Math.round(number * decimal) / decimal;
};

getWeightedMovieScores = async ({ user, count, similarity }) => {
  const comparedUserScores = await getCompareUserScores(
    user,
    count,
    similarity
  );
  const weightedUserScores = [];
  const movies = await getMovies();
  const weightedRatings = [];
  const weightedMovieScores = [];

  for (const user of comparedUserScores.comparedUsers) {
    for (const rating of user.ratings) {
      if (user != rating.UserId && user.similarity > 0) {
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
      if (movie.MovieId === ws.MovieId && user != ws.userId) {
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
    dbDir + 'movies.csv',
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
    dbDir + 'users.csv',
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
    dbDir + 'ratings.csv',
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
