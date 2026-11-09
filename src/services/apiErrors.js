export const apiContractError = (errorCode, message) => Object.assign(new Error(message), { response: { data: { errorCode, message } } });

export const requestConfirmed = async (request) => {
  try { return await request(); } catch (error) {
    if (!error.response) throw apiContractError('SERVER_CONFIRMATION_UNAVAILABLE', 'The server did not confirm this operation');
    throw error;
  }
};
