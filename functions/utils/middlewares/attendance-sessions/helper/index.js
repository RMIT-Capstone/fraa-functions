const {db} = require('../../../admin');

exports.getAttendanceSessionDocumentIdByDate = async date => {
  try {
    // const start = new Date(date);
    // start.setHours(0, 0, 0, 0);
    // const end = new Date(date);
    // end.setHours(23, 59, 59, 999);
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('validOn', '==', new Date(date))
      // .where('validOn', '>=', start)
      // .where('validOn', '<=', end)
      .get();

    if (querySnapshot.empty) return {exists: false, id: null};
    else {
      const id = querySnapshot.docs[0].id;
      return {exists: true, id};
    }
  }
  catch (errorGetAttendanceSessionDocumentIdByDate) {
    console.error('Something went wrong with get attendance session document id by date: ',
      errorGetAttendanceSessionDocumentIdByDate);
    return {exists: false, id: null};
  }
};
