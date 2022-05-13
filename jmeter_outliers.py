import csv
from itertools import islice
import time
import pandas as pd


class JMeterRow:

    def __init__(self, timestamp, elapsed, label, success, received_bytes, sent_bytes, grp_threads, all_threads, latency):
        self.timestamp = timestamp
        self.elapsed = int(elapsed)
        self.label = label
        self.success = bool(success.capitalize())
        self.received_bytes = int(received_bytes)
        self.sent_bytes = int(sent_bytes)
        self.grp_threads = int(grp_threads)
        self.all_threads = int(all_threads)
        self.latency = int(latency)


print("Reading...")
before = time.time()
# Read row data into list and count the line number.
# reader.line_num moves the file pointer and the file is thus not usable after being called.
with open("/Users/Garrido/Documents/GitHub/P10/benchmark-results/csharp/monolithic-service/mono_results_clients.csv", 'r', newline='\n') as f:
    reader = csv.reader(f, delimiter=',')
    data = list(reader)
time_spent = time.time() - before
print("Spent " + str(time_spent) + " seconds reading the CSV file")

values = {}
first_row = True
print("Processing...")
before = time.time()
for row in data:
    # Create keys with empty lists
    if first_row:
        for header in row:
            values[header] = []
        first_row = False
        continue

    # Add values to lists
    jmeter_row = JMeterRow(*row)

    # Filter out response times over 1000 as this is out of the ordinary.
    if jmeter_row.elapsed > 600:
        continue

    values["timeStamp"].append(jmeter_row.timestamp)
    values["elapsed"].append(jmeter_row.elapsed)
    values["label"].append(jmeter_row.label)
    values["success"].append(jmeter_row.success)
    values["bytes"].append(jmeter_row.received_bytes)
    values["sentBytes"].append(jmeter_row.sent_bytes)
    values["grpThreads"].append(jmeter_row.grp_threads)
    values["allThreads"].append(jmeter_row.all_threads)
    values["Latency"].append(jmeter_row.latency)

time_spent = time.time() - before
print("Spent " + str(time_spent) + " seconds processing the data")

print("Load into Dataframe..")
before = time.time()
df = pd.DataFrame(data=values)

time_spent = time.time() - before
print("Spent " + str(time_spent) + " seconds processing the data")

print("Outputting to CSV file..")
before = time.time()
df.to_csv("JMeterMonolithicClientsUnder600.csv", index=False)

time_spent = time.time() - before
print("Spent " + str(time_spent) + " seconds outputting the data")
