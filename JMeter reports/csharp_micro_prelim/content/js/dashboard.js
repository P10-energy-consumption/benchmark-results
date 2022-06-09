/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9905278364110577, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9988383803246604, 500, 1500, "[PET] GET PET BY ID"], "isController": false}, {"data": [0.9998208797201616, 500, 1500, "[STORE] GET ORDER BY ID AFTER UPDATE"], "isController": false}, {"data": [0.9618410740625396, 500, 1500, "[PET] UPDATE PET BY ID AFTER UPDATE"], "isController": false}, {"data": [0.9614542293925616, 500, 1500, "[PET] UPDATE PET BY ID"], "isController": false}, {"data": [0.9993891358582384, 500, 1500, "[PET] GET PET BY ID AFTER UPDATE"], "isController": false}, {"data": [0.9998785003867452, 500, 1500, "[STORE] GET ORDER BY ID"], "isController": false}, {"data": [0.9943156472860567, 500, 1500, "[USER] UPDATE USER BY ID"], "isController": false}, {"data": [0.9993856807136827, 500, 1500, "[PET] GET PETS BY STATUS"], "isController": false}, {"data": [0.9998305871723117, 500, 1500, "[STORE] GET INVENTORY"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7889433, 0, 0.0, 85.47241975437821, 1, 3761, 120.0, 404.90000000000146, 576.0, 1435.9700000000048, 1947.973036535391, 2255.319464785727, 418.263536835478], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["[PET] GET PET BY ID", 876793, 0, 0.0, 77.43307827503295, 1, 2627, 152.0, 225.0, 259.0, 386.9900000000016, 216.48819663250515, 57.0752390797956, 33.38654978988959], "isController": false}, {"data": ["[STORE] GET ORDER BY ID AFTER UPDATE", 876506, 0, 0.0, 38.91579293239254, 1, 2490, 52.0, 114.0, 135.0, 196.0, 216.4393513432359, 59.81673479505445, 34.875481417611255], "isController": false}, {"data": ["[PET] UPDATE PET BY ID AFTER UPDATE", 876597, 0, 0.0, 185.63327732127794, 3, 3761, 352.5, 684.0, 841.0, 1589.9700000000048, 216.4486205612572, 58.050924686900295, 66.37194028929176], "isController": false}, {"data": ["[PET] UPDATE PET BY ID", 876698, 0, 0.0, 187.0084304971614, 3, 3541, 358.0, 688.0, 845.0, 1665.9800000000032, 216.4721162191492, 57.81451102764613, 64.68795660455045], "isController": false}, {"data": ["[PET] GET PET BY ID AFTER UPDATE", 876627, 0, 0.0, 67.48333099482527, 1, 2505, 137.0, 202.0, 230.0, 372.0, 216.45469196650907, 57.89595633819744, 33.18690101439641], "isController": false}, {"data": ["[STORE] GET ORDER BY ID", 876546, 0, 0.0, 39.54991409464021, 1, 2526, 53.0, 112.0, 141.0, 204.0, 216.4437236342661, 60.01246307192221, 35.07070585625483], "isController": false}, {"data": ["[USER] UPDATE USER BY ID", 876529, 0, 0.0, 61.610825198026326, 2, 2574, 63.0, 137.0, 187.0, 1152.9900000000016, 216.43861729807116, 70.38482378931417, 77.99399392869948], "isController": false}, {"data": ["[PET] GET PETS BY STATUS", 876580, 0, 0.0, 70.63035433160955, 1, 2504, 138.0, 211.0, 242.0, 336.0, 216.44517115756608, 1794.4236549771426, 37.41288603016524], "isController": false}, {"data": ["[STORE] GET INVENTORY", 876557, 0, 0.0, 40.96581397444663, 1, 2469, 58.0, 117.0, 140.0, 205.0, 216.44275208385136, 39.94890639047647, 35.29876913867498], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7889433, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
