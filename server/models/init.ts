const dbInit = async (): Promise<void> => {
  console.log('No MongoDB initialization required when using CSV-backed storage');
};

export default dbInit;
