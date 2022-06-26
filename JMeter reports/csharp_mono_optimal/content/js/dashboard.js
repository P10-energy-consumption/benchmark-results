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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9999952168824916, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "[PET] GET PET BY ID"], "isController": false}, {"data": [1.0, 500, 1500, "[STORE] GET ORDER BY ID AFTER UPDATE"], "isController": false}, {"data": [0.9999713088885064, 500, 1500, "[PET] UPDATE PET BY ID AFTER UPDATE"], "isController": false}, {"data": [0.9999856700676373, 500, 1500, "[PET] UPDATE PET BY ID"], "isController": false}, {"data": [1.0, 500, 1500, "[PET] GET PET BY ID AFTER UPDATE"], "isController": false}, {"data": [1.0, 500, 1500, "[STORE] GET ORDER BY ID"], "isController": false}, {"data": [1.0, 500, 1500, "[USER] UPDATE USER BY ID"], "isController": false}, {"data": [1.0, 500, 1500, "[PET] GET PETS BY STATUS"], "isController": false}, {"data": [1.0, 500, 1500, "[STORE] GET INVENTORY"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 313603, 0, 0.0, 3.44047091386246, 0, 852, 3.0, 5.0, 6.0, 9.0, 521.9939445286869, 590.877295808338, 112.07741584259769], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["[PET] GET PET BY ID", 34910, 0, 0.0, 3.144170724720704, 0, 172, 3.0, 4.0, 5.0, 7.0, 58.108373531477724, 13.674202726399612, 8.961515816471751], "isController": false}, {"data": ["[STORE] GET ORDER BY ID AFTER UPDATE", 34784, 0, 0.0, 2.4179795308187635, 0, 116, 2.0, 3.0, 4.0, 6.0, 58.02826675919871, 14.393730231285616, 9.350257827409948], "isController": false}, {"data": ["[PET] UPDATE PET BY ID AFTER UPDATE", 34854, 0, 0.0, 5.443019452573603, 1, 852, 4.0, 7.0, 8.0, 17.0, 58.066096123762385, 14.108459595591482, 17.805424006700576], "isController": false}, {"data": ["[PET] UPDATE PET BY ID", 34892, 0, 0.0, 5.324114410179984, 1, 505, 4.0, 7.0, 8.0, 15.0, 58.096495595142756, 13.684886359095351, 17.36086684776727], "isController": false}, {"data": ["[PET] GET PET BY ID AFTER UPDATE", 34876, 0, 0.0, 2.2859846312650802, 0, 121, 2.0, 3.0, 4.0, 5.0, 58.08716739283953, 13.898524263917203, 8.905942656909968], "isController": false}, {"data": ["[STORE] GET ORDER BY ID", 34816, 0, 0.0, 2.4628906250000244, 0, 354, 2.0, 3.0, 4.0, 6.0, 58.046305666750584, 14.450304058602326, 9.405263819988262], "isController": false}, {"data": ["[USER] UPDATE USER BY ID", 34797, 0, 0.0, 4.02531827456388, 1, 346, 3.0, 5.0, 6.0, 11.0, 58.02875339155609, 17.227286163118215, 20.910751954574412], "isController": false}, {"data": ["[PET] GET PETS BY STATUS", 34842, 0, 0.0, 3.416106997302122, 0, 116, 3.0, 5.0, 5.0, 7.0, 58.059065542656136, 479.6108288928501, 10.035600196338022], "isController": false}, {"data": ["[STORE] GET INVENTORY", 34832, 0, 0.0, 2.441002526412508, 0, 299, 2.0, 3.0, 4.0, 6.0, 58.05236579390344, 10.487976242062633, 9.467524499591674], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 313603, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
