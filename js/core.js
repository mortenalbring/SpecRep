function readText(filePath) {
	var output = ""; 
        if(filePath.files && filePath.files[0]) {           
            reader.onload = function (e) {
                output = e.target.result;
                parseSpectra(output);
            };
            reader.readAsText(filePath.files[0]);
        }
        return output;
    }   

function getOutput(fileName){
    $.get("server/get_output.php",{fileName:fileName},function(data){
                        
                        parseSpectra(data);
                        
                        
                        
                    });
}

//add file to mongodb
function addFiles(file){
    var data = new FormData($('form')[0]);
   
    $.ajax({
        url: 'server/upload_file.php',
        type: 'POST',
        data: formdata,
        cache: false,
        contentType: false,
        processData: false,
        success:function(data){
            if(data){
                $('#fileupload').append('file is already in database');
            }
            else{
               // getFileNames();
            }
        }
    })
}

//get file names from db
function getFileNames(){

    $.get("server/getFileNames.php",function(data){
        //console.log(data.length);
        if(data){
            $('#filelist').empty();
            for(var i=0;i<data.length;i++){
                
                $('#fileList').append('<ul><a href="#" onClick="getOutput(\''+data[i]+'\');">'+data[i]+'</a></ul>');
            }
        }    
        else{
            
            $('#fileList').append('<ul>no files in database</ul>');
        }
        
    },"json")
}

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
	

	var JSONstr = "[";
	for (var i=0;i<number_of_lines-2;i++) {
		if (i>0) {
		JSONstr += ",";
		}
		JSONstr += '\n';
		JSONstr += "{";
		JSONstr += '"x":';
		JSONstr += firstCol[i];
		JSONstr += ',"y":';
		JSONstr += thirdCol[i];
		JSONstr += "}";
	}
	JSONstr += "]";
	
	//console.log(JSONstr);
	//d3Plot(eprData);	//send final 2d array to be plotted
	d3Plot_JSON(JSONstr);

	}   


d3Plot_JSON = function(JSONstr) { 

margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 45
};

	data = JSON.parse(JSONstr);
	
	//Width and height
	width = 480 - margin.left - margin.right;
	height = 250 - margin.top - margin.bottom;

	//Scale data to fit window
	var x = d3.scale.linear()
		.domain(d3.extent(data, function (d) {
		return d.x;
	}))
		.range([0, width]);

	var y = d3.scale.linear()
		.domain(d3.extent(data, function (d) {
		return d.y;
	}))
		.range([height, 0]);

	//Describe line
	var line = d3.svg.line()
		.x(function (d) {
		return x(d.x);
	})
		.y(function (d) {
		return y(d.y);
	});

	//Zoom!
	var zoom = d3.behavior.zoom()
		.x(x)
		.y(y)
		.scaleExtent([0.9,10])
		.on("zoom", zoomed);

	d3.select("svg")
		.remove();
	//Init svg object
	svg = d3.select('#chart')
		.append("svg:svg")
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.call(zoom)
		.append("svg:g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	//Functions for scaling axes
	var make_x_axis = function () {
		return d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.ticks(16);
	};

	var make_y_axis = function () {
		return d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(16);
	};

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.ticks(8);

	svg.append("svg:g")
		.attr("class", "x axis")
		.attr("transform", "translate(0, " + height + ")")
		.call(xAxis);

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(5);
		
	//Put axes on chart

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis);

	svg.append("g")
		.attr("class", "x grid")
		.attr("transform", "translate(0," + height + ")")
		.call(make_x_axis()
		.tickSize(-height, 0, 0)
		.tickFormat(""));

	svg.append("g")
		.attr("class", "y grid")
		.call(make_y_axis()
		.tickSize(-width, 0, 0)
		.tickFormat(""));
		
	
	//Render stuff when zoomed in

	var clip = svg.append("svg:clipPath")
		.attr("id", "clip")
		.append("svg:rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width)
		.attr("height", height);

	var chartBody = svg.append("g")
		.attr("clip-path", "url(#clip)");

	chartBody.append("svg:path")
		.datum(data)
		.attr("class", "line")
		.attr("d", line);

	//Function for how to behave when zooming in
	function zoomed() {
		svg.select(".x.axis").call(xAxis);
		svg.select(".y.axis").call(yAxis);
		svg.select(".x.grid")
			.call(make_x_axis()
			.tickSize(-height, 0, 0)
			.tickFormat(""));
		svg.select(".y.grid")
			.call(make_y_axis()
			.tickSize(-width, 0, 0)
			.tickFormat(""));
		svg.select(".line")
			.attr("class", "line")
			.attr("d", line);
	}


}
