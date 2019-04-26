# natscat

NATS command line utility

# usage
```
$ natscat
natscat [messages...]

Options:
  --version          Show version number                               [boolean]
  ----nats, -n       nats url
  ----subject, -j    subjects
  ----subscribe, -s  subscribe                                         [boolean]
  ----publish, -p    publish                                           [boolean]
  ----request, -r    request                                           [boolean]
  ----file, -f       input json or yaml file
  --help             Show help                                         [boolean]
```

# example 

subscribe to subject
```bash
# subscribe
$ natscat -sc test.subject
2019-04-26 10:10:11.524      subscribed to test.subject
2019-04-26 10:10:33.095 <=== hello natscat  test.subject 
```

publish message to subject
```bash
# publish
$ natscat -pc test.subject "hello natscat"
2019-04-26 10:10:33.098 ===> hello natscat  test.subject
```

subscribe and reply
```bash
# subscribe & reply
$ natscat -sc test.subject "you too"
2019-04-26 10:13:18.921      subscribed to test.subject
2019-04-26 10:13:25.564 <=== hello natscat  test.subject 
2019-04-26 10:13:25.568 ===> you too  _INBOX.IN62QEIRU5TYT3Q0UEERN5.IN62QEIRU5TYT3Q0UEERR7 
```

request
```bash
# request
$ natscat -rc test.subject "hello natscat"
2019-04-26 10:13:24.896 ===> hello natscat  test.subject 
2019-04-26 10:13:25.569 <=== you too  test.subject
```

send multiple message to multiple subject
```bash
$ natscat -p -j test.subject1 -j test.subject2 message1 message2
2019-04-26 10:21:28.977 ===> message1  test.subject1
2019-04-26 10:21:29.655 ===> message1  test.subject2
2019-04-26 10:21:29.656 ===> message2  test.subject1
2019-04-26 10:21:29.658 ===> message2  test.subject2
```

send json messages from yaml/json file
```bash
$ cat > messages.yaml <<EOF
first: message
---
{"second": "message"}
EOF

$ natscat -pj test.subject -f message.yaml
2019-04-26 10:24:08.861 ===> {"first":"message"}  test.subject
2019-04-26 10:24:09.526 ===> {"second":"message"}  test.subject
```

specify nats server
```bash
$ export NATS=127.0.0.1:4222
$ natscat -pj test.subject hello
2019-04-26 10:34:08.515      connecting to nats 127.0.0.1:4222
2019-04-26 10:34:09.194 ===> hello  test.subject

$ natscat -n nats:4222 -pj test.subject hello
2019-04-26 10:35:08.893      connecting to nats nats:4222
2019-04-26 10:35:09.558 ===> hello  test.subject
```
