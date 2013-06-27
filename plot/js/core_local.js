function readText(filePath) {
	var reader; 
	reader = new FileReader();

	var output = ""; 
        if(filePath.files && filePath.files[0]) {           
            reader.onload = function (e) {
                output = e.target.result;
				document.write(output);
                //parseSpectra(output);
            };
            reader.readAsText(filePath.files[0]);
        }
        return output;
    }   

//place contents of text file into 2d array
parseSpectra = function (txt) {
	var txt_lines = txt.split('\n');
	var number_of_lines = txt_lines.length;		


	//Initatilising arrays
	//First column is field values
	//Second column is absorption values
	//Third colum is going to be the first derivative of col 2 wrt col 1

	var eprData= [[0,0],[0,0],[0,0]];	//final data array containing col1 and col3
	var firstCol = [],
	 secondCol = [],
	 thirdCol = [],
	 tempData = [];	//temp array used to create 2d array

	 
	
	
	var str = "";
	for (var i=0;i<number_of_lines-2;i++) {
	//Lines are parsed into columns by specific formatting of my data
	//Probably a more robust, more general way of doing this
	firstCol[i] = parseFloat(txt_lines[i].substring(0,25));
	secondCol[i] = parseFloat(txt_lines[i].substring(27,44));
	
	if (i >= 1) {

	//Calcualtes derivative
	thirdCol[i] = ((secondCol[i] - secondCol[i-1]) / (firstCol[i] - firstCol[i-1]));
	
	
	tempData[0] = firstCol[i];
	tempData[1] = thirdCol[i];
	eprData[i] = tempData;	//push temp array into final data array

	}
	else {
	
	thirdCol[i] = 0;
	tempData[0] = firstCol[i];
	tempData[1] = thirdCol[i];
	eprData[i] = tempData;	//push temp array into final data array
	}
	tempData = [];	//clear temp array
	


	}

	d3Plot(eprData);	//send final 2d array to be plotted

	}   


}