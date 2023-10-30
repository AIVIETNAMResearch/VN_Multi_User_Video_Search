// const headers = [
//   lst_video_idxs,
//   lst_keyframe_idxs
// ]

const download = function (data) {
  // Creating a Blob for having a csv file format
  // and passing the data with type
  const blob = new Blob([data], { type: "text/csv" });

  // Creating an object for downloading url
  const url = window.URL.createObjectURL(blob);

  // Creating an anchor(a) tag of HTML
  const a = document.createElement("a");

  // Passing the blob downloading url
  a.setAttribute("href", url);

  // Setting the anchor tag attribute for downloading
  // and passing the download file name
  a.setAttribute("download", "download.csv");

  // Performing a download with click
  a.click();
};

const csvmaker = function (data) {
  // Empty array for storing the values
  let csvRows = [];

  // Headers is basically a keys of an object which
  // is id, name, and profession
  const headers = Object.keys(data[0]);

  // As for making csv format, headers must be
  // separated by comma and pushing it into array
  // csvRows.push(headers.join(","));

  // Pushing Object values into the array with
  // comma separation

  // Looping through the data values and make
  // sure to align values with respect to headers
  for (const row of data) {
    const values = headers.map((e) => {
      return row[e];
    });
    csvRows.push(values.join(","));
  }

  // const values = Object.values(data).join(',');
  // csvRows.push(values)

  // returning the array joining with new line
  return csvRows.join("\n");
};


const get = function (videoArray, indexArray) {
  // JavaScript object
  const formatted_data = videoArray.map((res, index) => ({
    video_idx: res,
    keyframe_idx: indexArray[index]
  }))
  console.log(videoArray)
  console.log(formatted_data)

  const csvdata = csvmaker(formatted_data);
  download(csvdata);
};

export default get

