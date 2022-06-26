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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9994292661947738, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "[PET] GET PET BY ID"], "isController": false}, {"data": [1.0, 500, 1500, "[STORE] GET ORDER BY ID AFTER UPDATE"], "isController": false}, {"data": [0.9985164067954386, 500, 1500, "[PET] UPDATE PET BY ID AFTER UPDATE"], "isController": false}, {"data": [0.9975014526438117, 500, 1500, "[PET] UPDATE PET BY ID"], "isController": false}, {"data": [1.0, 500, 1500, "[PET] GET PET BY ID AFTER UPDATE"], "isController": false}, {"data": [1.0, 500, 1500, "[STORE] GET ORDER BY ID"], "isController": false}, {"data": [0.9988486985922062, 500, 1500, "[USER] UPDATE USER BY ID"], "isController": false}, {"data": [1.0, 500, 1500, "[PET] GET PETS BY STATUS"], "isController": false}, {"data": [1.0, 500, 1500, "[STORE] GET INVENTORY"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 309251, 0, 0.0, 5.707729320196273, 0, 1293, 2.0, 5.0, 8.0, 38.0, 514.7174597256735, 582.5852775002621, 110.51722559396205], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["[PET] GET PET BY ID", 34439, 0, 0.0, 3.420569702953049, 1, 117, 2.0, 4.0, 6.0, 23.0, 57.32028221571626, 13.48906728255026, 8.839854341047273], "isController": false}, {"data": ["[STORE] GET ORDER BY ID AFTER UPDATE", 34304, 0, 0.0, 3.0013409514925358, 0, 144, 2.0, 3.0, 6.0, 19.0, 57.22445384543526, 14.194346949941947, 9.220737191891422], "isController": false}, {"data": ["[PET] UPDATE PET BY ID AFTER UPDATE", 34376, 0, 0.0, 10.282173609494981, 2, 1293, 3.0, 7.0, 16.0, 104.9900000000016, 57.264224019456776, 13.885845007954291, 17.55953744346624], "isController": false}, {"data": ["[PET] UPDATE PET BY ID", 34420, 0, 0.0, 12.692504357931337, 2, 1264, 3.0, 8.0, 19.0, 234.0, 57.3110749239904, 13.525532577150164, 17.12616106127057], "isController": false}, {"data": ["[PET] GET PET BY ID AFTER UPDATE", 34396, 0, 0.0, 2.824630771019906, 0, 95, 2.0, 3.0, 6.0, 20.0, 57.28790185307942, 13.70484748028834, 8.783399014583466], "isController": false}, {"data": ["[STORE] GET ORDER BY ID", 34320, 0, 0.0, 3.0225524475524344, 0, 106, 2.0, 3.0, 6.0, 20.0, 57.22050401393833, 14.244874921325977, 9.271608459177038], "isController": false}, {"data": ["[USER] UPDATE USER BY ID", 34309, 0, 0.0, 9.07324608703247, 1, 1110, 3.0, 7.0, 16.0, 140.9900000000016, 57.2133247063375, 16.985205772193947, 20.616910953748572], "isController": false}, {"data": ["[PET] GET PETS BY STATUS", 34354, 0, 0.0, 4.088635966699683, 1, 306, 2.0, 4.0, 7.0, 26.0, 57.237682835193, 472.83348613855577, 9.89362291194254], "isController": false}, {"data": ["[STORE] GET INVENTORY", 34333, 0, 0.0, 2.9528733288672533, 0, 94, 2.0, 3.0, 6.0, 19.0, 57.22271574978875, 10.338088294639569, 9.332220244350312], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 309251, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
