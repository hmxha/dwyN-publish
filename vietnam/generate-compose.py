# coding=utf-8
from jinja2 import Template

template = """
version: '3'

services:
  lobby:
    image: runner
    container_name: lobby
    privileged: true
    restart: always
    ports:
      - 3658:3658
      - 6034:6034
    volumes:
      - /data/vietnam/bin:/vietnam
    working_dir: /vietnam
    command: ./app
    networks:
      - vietnam_net

  admin:
    image: runner
    container_name: admin
    privileged: true
    restart: always
    ports:
      - 6043:6043
    volumes:
      - /data/vietnam/bin:/vietnam
    working_dir: /vietnam
    command: ./app admin/config.toml
    networks:
          - vietnam_net

  robot:
    image: runner
    container_name: robot
    privileged: true
    restart: always
    volumes:
      - /data/vietnam/bin:/vietnam
    working_dir: /vietnam
    command: ./app robot/config.toml
    networks:
      - vietnam_net

{% for service, ports in services.items() %}
  {{ service }}:
    image: runner
    container_name: {{ service }}
    privileged: true
    restart: always
    ports:
      {% for port in ports -%}
      - {{ port }}
      {% endfor %}
    volumes:
      - /data/vietnam/bin:/vietnam
    working_dir: /vietnam
    command: ./app {{ service }}/config.toml
    networks:
      - vietnam_net
{% endfor %}

networks:
  vietnam_net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
"""

services = {
    "minigame": ["1000:3658", "1034:6034"],

    "smxw_1": ["3000:3658", "3034:6034"],
    "smxw_2": ["3100:3658", "3134:6034"],
    "smxw_3": ["3200:3658", "3234:6034"],
    "smxw_4": ["3300:3658", "3334:6034"],

    "south_1": ["4000:3658", "4034:6034"],
    "south_2": ["4100:3658", "4134:6034"],
    "south_3": ["4200:3658", "4234:6034"],
    "south_4": ["4300:3658", "4334:6034"],

    "caishen_1": ["5000:3658", "5034:6034"],

    "phom_1": ["6400:3658", "6434:6034"],
    "phom_2": ["6500:3658", "6534:6034"],
    "phom_3": ["6600:3658", "6634:6034"],
    "phom_4": ["6700:3658", "6734:6034"],

    "samloc_1": ["7000:3658", "7034:6034"],
    "samloc_2": ["7100:3658", "7134:6034"],
    "samloc_3": ["7200:3658", "7234:6034"],
    "samloc_4": ["7300:3658", "7334:6034"],
    "samloc_5": ["7400:3658", "7434:6034"],
}

t = Template(template)
output = t.render(services=services)

# 写入文件
with open('docker-compose.yml', 'w') as file:
    file.write(output)
