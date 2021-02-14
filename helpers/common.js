// Core
import { parseCookies } from 'nookies';

import { UserType } from '../const/const';
import { developmentLogger, productionLogger } from "./logger";
import { END } from 'redux-saga';

export const getUniqueId = () => Math.floor(Math.random() * 1000000);

export const setDateOfReceiving = (promises, data, fileName) => {
  const updatedData = data.map((item) => {
    item.dateOfReceiving = `${new Date()}`;
    return item;
  });
  promises.writeFile(fileName, '');
  promises.writeFile(fileName, JSON.stringify(updatedData, null, 4));
}

export const getCurrentUser = (data, userId) => {
  return data.findIndex(user => user.id == userId);
}

export const getUserType = (visitCount) => {
  if (visitCount < 3) {
    return UserType.GUEST;
  } else if (visitCount >= 3 && visitCount < 5) {
    return UserType.FRIEND;
  } else {
    return UserType.FAM;
  }
}

export const updateUserType = (userType) => {
  if (userType === UserType.GUEST) {
    return UserType.FRIEND;
  } else {
    return UserType.FAM;
  }
}

export const getParsedFile = (source) => {
  return source ? JSON.parse(source) : [];
}

export const getItemById = (arr, id) => {
  const isCurrentItem = (element, index, array) => {
    return element.id === id;
  };
  const currentIndex = arr.findIndex(isCurrentItem);

  return arr[currentIndex];
}

export const getSlugIndex = (data, slug) => {
  return data.findIndex((element, index, array) => {
    if (element && slug) {
      return slug === element.id;
    }
  });
}

export const serverDispatch = async (store, execute) => {
  const { dispatch } = store;

  execute(dispatch);
};

export const disableSaga = async (store) => {
  const { dispatch } = store;

  dispatch(END);

  await store.sagaTask.toPromise();
};

export const environmentVerify = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    isDevelopment,
    isProduction,
  };
};

export const serverReduxLogger = store => next => action => {
  developmentLogger.info(`Redux Dispatch: ${action.type}`);

  next(action);
};

export const browserVerify = () => typeof window !== 'undefined';

export const serverGraphqlInformationLogger = (query, { isStarted, isFinished }) => {
  const graphQlDocument = query.query;
  const currentGraphQLDocument = graphQlDocument.definitions[0];
  const operation = 'operation' in currentGraphQLDocument ? currentGraphQLDocument.operation : 'unknown graphQl operation';
  const document = 'name' in currentGraphQLDocument ? currentGraphQLDocument.name && currentGraphQLDocument.name.value : 'unknown graphQl document';
  const prefix = (isStarted && 'was started.') || (isFinished && 'was finished.');
  const action = JSON.stringify({document, operation});
  const message = `GraphQL ${operation} ${action} ${prefix}`;

  developmentLogger.log({
    level: 'info',
    message,
  });
};

export const serverGraphqlErrorLogger = (query, err, context) => {
  const { isDevelopment } = environmentVerify();
  const graphQlDocument = query.query;
  const currentGraphQLDocument = graphQlDocument.definitions[0];
  const operation = 'operation' in currentGraphQLDocument ? currentGraphQLDocument.operation : 'unknown graphQl operation';
  const document = 'name' in currentGraphQLDocument ? currentGraphQLDocument.name && currentGraphQLDocument.name.value : 'unknown graphQl document';
  const message = `GraphQL SSR ${operation}`;

  const responseCode = err.networkError && 'statusCode' in err.networkError
    && err.networkError.statusCode;

  const responseMessage = err.networkError && 'result' in err.networkError
    && err.networkError.result.message;

  const networkErrorType = err.networkError && 'Network Error';
  const graphQlErrorType = Array.isArray(err.graphQLErrors) && err.graphQLErrors.length > 0 && 'GraphQL Error';
  const errorType = networkErrorType || graphQlErrorType;

  const loggerData = new Map();

  loggerData.set('level', 'error');
  loggerData.set('type', errorType);
  loggerData.set('document', document);
  loggerData.set('operation', operation);

  if (responseCode) {
    loggerData.set('responseCode', responseCode);
  }

  if (responseMessage) {
    loggerData.set('responseMessage', responseMessage);
  }

  if (isDevelopment) {
    loggerData.set('message', message);

    const transformedLoggerData = Object.fromEntries(loggerData);

    developmentLogger.log(transformedLoggerData);
  } else {
    const fullMessage = err instanceof Error ? err.message : 'unfortunately we don\'t have a message for this error';
    const stack = err instanceof Error && err.stack;

    loggerData.set('name', `GraphQL SSR ${operation} ${errorType}`);
    loggerData.set('message', fullMessage);
    loggerData.set('producer', 'SSR Server');

    if (stack) {
      loggerData.set('stack', stack);
    }

    if (graphQlErrorType) {
      const graphQlQuery = query.query && query.query.loc.source && query.query.loc.source.body;
      const graphQLValidationsErrors = err.graphQLErrors
        && err.graphQLErrors.length > 0
        && JSON.stringify(err.graphQLErrors);

      if (graphQlQuery) {
        loggerData.set('body', graphQlQuery);
      }

      if (graphQLValidationsErrors) {
        loggerData.set('graphQLValidationsErrors', graphQLValidationsErrors);
      }

      const transformedLoggerData = Object.fromEntries(loggerData);

      productionLogger.log(transformedLoggerData);
    } else if (networkErrorType && context) {
      const cfRequestId = context.req.headers['cf-request-id'];
      const variables = JSON.stringify(query.variables);

      const cookies = parseCookies(context);
      const JWT = cookies['x-jwt-token'];

      if (variables) {
        loggerData.set('variables', variables);
      }

      if (cfRequestId) {
        loggerData.set('cfRequestId', cfRequestId);
      }

      if (JWT) {
        loggerData.set('JWT', JWT);
      }

      const transformedLoggerData = Object.fromEntries(loggerData);

      productionLogger.log(transformedLoggerData);
    }
  }
};
