#! /bin/sh

./../Downloads/apache-jmeter-5.4.3/bin/jmeter -g data/JMeterClients3Microservice.csv -o "JMeter reports/csharp_micro" -Jjmeter.reportgenerator.overall_granularity=1000
./../Downloads/apache-jmeter-5.4.3/bin/jmeter -g data/JMeterClients3Monlithic.csv -o "JMeter reports/csharp_mono" -Jjmeter.reportgenerator.overall_granularity=1000
./../Downloads/apache-jmeter-5.4.3/bin/jmeter -g data/JMeterClients3MicroserviceJava.csv -o "JMeter reports/java_micro" -Jjmeter.reportgenerator.overall_granularity=1000
./../Downloads/apache-jmeter-5.4.3/bin/jmeter -g data/JMeterClients3MonolithicJava.csv -o "JMeter reports/java_mono" -Jjmeter.reportgenerator.overall_granularity=1000