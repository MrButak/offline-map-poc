# Map Tile Server + Example PWA Monorepo

This project uses npm workspaces to manage multiple related projects in a single repository.

## Project Structure
- **frontend**: Vue(Quasar) frontend for the app(PWA)

# To start the project:

## Add a .env file to /frontend with the following properties:
**You'll need your Maptiler/Mapbox api keys for satllite imagery.**
```
VITE_MAPLIER_API_KEY=your_api_key
VITE_MAPBOX_API_KEY=your_api_key
VITE_BASE_FRONTEND_URL=http://localhost:9200/
VITE_TILE_SERVER_URL=https://tiles.yourdomain.com/
```
### To start the app:
```npm i``` in the root folder
```cd frontend```
```npm run dev-pwa```

# Server Setup - two steps

#######################################################
## Step 1. Initial setup and hardning (optional just an example of how I like to setup a hetzner VPS)
#######################################################
We use a Hetzner server with the following cloud config on creation:

### 1. Create server with cloud config
```
#cloud-config
users:
  - name: yourusername
    groups: sudo
    shell: /bin/bash
    sudo: ['ALL=(ALL) NOPASSWD: ALL']
    lock_passwd: false
    ssh_authorized_keys:
      - ssh-rsa Your public key

# Update and upgrade packages
package_update: true
package_upgrade: true

# Install necessary packages
packages:
  - software-properties-common
  - python3
  - curl
  - wget
  - git
  - ufw
  - ansible-core # For hardening the server
  - fail2ban

runcmd:  
  # Add Ansible PPA and install Ansible
  - sudo add-apt-repository --yes --update ppa:ansible/ansible
  - sudo apt install --yes ansible
  - mkdir /home/yourusername/ansible
  - chown yourusername:yourusername /home/yourusername/ansible

# Final system update and reboot
power_state:
  mode: reboot
  message: Rebooting after initial setup
```
Now ssh into the server `ssh yourusername@serverIP`  
If you get a message:

    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    @    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
    Someone could be eavesdropping on you right now (man-in-the-middle attack)!
    It is also possible that a host key has just been changed.
    

Then `ssh-keygen -f "/home/dev/.ssh/known_hosts" -R "serverIP"` make sure to replace the path.

**Set a password**
`sudo passwd yourusername`

### 2. Run Ansible harding playbook

We use [Ansible](https://www.ansible.com/)  to run pre-configured settings for the OS/Kernal and SSH.

❗After running the following configs the default SSH port is changed to **2222**. `ssh yourusername@server.ip -p 2222`

**Ansible setup:**
Navigate to directory, create an inventory file, and install the Ansible hardening role:

    cd ansible
    echo "localhost ansible_connection=local" > inventory
    ansible-galaxy collection install devsec.hardening
    

ℹ️ We use this collection: [ansible-collection-hardening](https://github.com/dev-sec/ansible-collection-hardening/tree/master) 
Create a playbook file named hardening.yml:  
`nano hardening.yml`

```

- hosts: all
  become: yes
  roles:
    - devsec.hardening.os_hardening
    - devsec.hardening.ssh_hardening
  vars:
    # OS Hardening Configuration

    # Allow users without home directories to login
    os_auth_allow_homeless: true

    # Enable core dumps for debugging purposes
    os_security_kernel_enable_core_dump: true

    # Enforce SUID/SGID bit restrictions
    os_security_suid_sgid_enforce: true

    # Use default SUID/SGID blacklist
    os_security_suid_sgid_blacklist: []

    # Prevent automatic removal of packages
    os_security_packages_clean: false

    # Users to ignore in the hardening process
    # os_ignore_users:
    #  - newuser

    # Allow outbound traffic for updates and external connections
    os_allow_outbound_traffic:
      - 80
      - 443

    # Optimizations for high-performance web server
    sysctl_overwrite:
      # Allows more outgoing connections
      net.ipv4.ip_local_port_range: "1024 65535"
      # Increases connection request queue
      net.ipv4.tcp_max_syn_backlog: 40000
      # Increases connection accept queue
      net.core.somaxconn: 65535

    # Additional path for user applications
    os_env_extra_user_paths: 
      - /usr/local/bin

    # Allow compiler access for building code
    manage_compilers: true

    # SSH Hardening Configuration

    # Custom SSH port for enhanced security
    ssh_server_ports: 
      - 2222

    # Set authentication methods to allow both publickey and password
    sshd_authenticationmethods: "publickey,password"

    # Keep SFTP enabled for file transfers
    sftp_enabled: true

    # Allow password login for yourusername
    ssh_server_password_login: true

    # Restrict SSH access to these users
    ssh_allow_users: "yourusername"

    # Explicitly disable root login via SSH
    ssh_permit_root_login: "no"

    # Allow agent forwarding for CI/CD pipeline
    ssh_allow_agent_forwarding: true

    # Enable TCP forwarding if needed for your applications
    ssh_allow_tcp_forwarding: "yes"

    # Increased grace time for slower connections
    ssh_login_grace_time: 60s

    # Adjust client alive interval for longer-running tasks
    ssh_client_alive_interval: 600

    # Allow more authentication attempts
    ssh_max_auth_retries: 5

    # Disable X11 forwarding for security (enable if GUI apps are needed)
    ssh_x11_forwarding: false

    # Allow specific environment variables
    sshd_custom_options:
      - "AcceptEnv LANG LC_*"

    # Keep PAM support enabled
    ssh_use_pam: true

    # Ensure SSH starts on boot
    ssh_server_service_enabled: true
```

Run the Ansible configs:  
```
ansible-playbook -i inventory hardening.yml
```
 
You'll ssh into the server now with `ssh yourusername@server.ip.address -p 2222`



### 3. Setup Firewall
```
sudo ufw default allow outgoing 
sudo ufw allow 2222/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable
```

Check it:
```
sudo ufw status verbose
```

### 4. Setup Fail2Ban
https://github.com/fail2ban/fail2ban

Make sure it is installed:
```
sudo systemctl status fail2ban
```

add settings:
```
sudo nano /etc/fail2ban/jail.local
```

```
[DEFAULT]
bantime = -1
findtime = 24h
maxretry = 3

[sshd]
mode = aggressive
enabled = true
port = 2222
filter = sshd
maxretry = 3
findtime = 24h
bantime = -1
logpath = %(sshd_log)s
backend = %(sshd_backend)s

[sshd-ddos]
enabled = true
port = 2222
filter = sshd-ddos
logpath = %(sshd_log)s
maxretry = 2
findtime = 2m
bantime = -1
```

Enable to service so it restarts automatically:
```
sudo systemctl enable fail2ban.service
```

Restart:
```
sudo systemctl restart fail2ban
```

Make everything is running and view all activated jails:
```
sudo fail2ban-client status
```

Check individual jails:
```
sudo fail2ban-client status sshd
```

#######################################################
## Step 2. Setup tile server - two options
#######################################################
# 1. Download the pmtiles file (Option 1 protomaps)
https://docs.protomaps.com/basemaps/downloads

**Create the directory**
```
sudo mkdir -p /srv/pmtiles
```
**Give ourselves ownership of the new dir**
```
sudo chown -R yourusername:yourusername /srv/pmtiles
```

**Navigate to the new dir**
```
cd /srv/pmtiles
```

**Download the planet file**

Replace the date with current/double check the [build page](https://maps.protomaps.com/builds/) for latest build.
-c flag allows resume if interrupted, -O names the output file as planet.pmtiles
```
wget -c https://build.protomaps.com/20251117.pmtiles -O planet.pmtiles
```

# 1. Build tiles with OpenStreetMap data (Option 2)
**This is what I went with.**

**Overview:**
Tiles are OSM data organized in OpenMapTiles format. Since we use MapLibre - we use the [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/).

*   **Data:** OpenStreetMap data (roads, buildings, etc. from OSM contributors)
*   **Schema:** OpenMapTiles schema (how the data is organized into layers)
*   **Format:** PMTiles file format
*   **Generator:** Planetiler tool 

**Note about styling:**
Styling: Use Maputnik (https://maputnik.github.io/editor/) to visually design 
map styles, then export as style.json for use in your app.
You're also going to need the Fonts and Sprites used by the map style/tiles.

We rented a powerful Hetzner server for the download and build. It took ~10 hours.

**Create the directory**
```
sudo mkdir -p /srv/pmtiles
```
**Give ourselves ownership of the new dir**
```
sudo chown -R yourusername:yourusername /srv/pmtiles
```

**Navigate to the new dir**
```
cd /srv/pmtiles
```

**Start a long-running process in a named screen session**
```
screen -S planetiler
```

**Run command to download and build the whole planet into one .pmtiles file**
**Note:** `-Xmx28g` is RAM allocation. May need to adjust based on the build server specs.
```
java -Xmx28g -jar planetiler.jar \
  --download \
  --area=planet \
  --output=planet.pmtiles
```
**Additional notes on `screen`**

 Detach and leave it running in the background
`Ctrl+A then D`

Reattach later to check progress
```
screen -r planetiler
```

**When the process is finished:**

If you're inside the session, it's just:
`exit`

If the session is stuck or you want to remove it from outside:
```
screen -S planetiler -X quit
```

**To move the .pmtiles file from the build server to the tile server**
You can either:
1. transfer from VPS to VPS  
2. transfer to home pc then from home pc to the tile server.

I went with option 2.

**Transfer file from temp build server to home pc**
```
rsync -avP --partial -e 'ssh -p 2222' tmpbuildserverloginname@tmp.server.ip:~/planetiler-build/planet-openmaptiles.pmtiles ~/
```
**Transfer from home pc to the tile server**
```
rsync -avP --partial -e 'ssh -p 2222' ~/planet-openmaptiles.pmtiles yourusername@tile.server.ip:/srv/pmtiles/****
```
**Note:**
You can resume with `rsync` if the connection is cut. Just re-enter the command.

# 2. Install and build Caddy with pmtiles_proxy module

**Install Go 1.23**
```
cd ~
wget https://go.dev/dl/go1.23.3.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.23.3.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin
echo 'export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin' >> ~/.bashrc
```
**Verify Go installation**
```
go version
```
**Install xcaddy**
```
go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest
```
**Build Caddy with pmtiles module**
```
xcaddy build --with github.com/protomaps/go-pmtiles/caddy
```
**Install the custom Caddy binary with proper permissions**
```
sudo mv caddy /usr/bin/caddy
sudo chown root:root /usr/bin/caddy
sudo chmod 755 /usr/bin/caddy
sudo setcap cap_net_bind_service=+ep /usr/bin/caddy
```
**Verify Caddy installation**
```
caddy version
```

# 3. Configure Caddy to server the tiles from a domain
**Add a DNS A record to a domain/subdomain**
We currently use tiles.yourtiledomain.com. The A record host is tiles and the value is the server ip.

**Create caddy dir and Caddyfile**
Since we build Caddy ourselves there will be no default /etc/caddy/Caddyfile like you would normally get from a regular Caddy installation.
```
sudo mkdir -p /etc/caddy
```
```
sudo nano /etc/caddy/Caddyfile
```

**Add Caddy config**
```                                                                                                    
  GNU nano 7.2                                                                                                 /etc/caddy/Caddyfile *                                                                                                        
{
    order pmtiles_proxy before file_server
}

tiles.yourtiledomain.com {
    pmtiles_proxy {
        bucket file:///srv/pmtiles
        cache_size 256
    }
}
```
**Validate config**
```
sudo caddy validate --config /etc/caddy/Caddyfile
```

**Create a service file for Caddy**
```
sudo nano /etc/systemd/system/caddy.service
```

```
[Unit]
Description=Caddy
Documentation=https://caddyserver.com/docs/
After=network.target network-online.target
Requires=network-online.target

[Service]
Type=notify
User=caddy
Group=caddy
WorkingDirectory=/etc/caddy
ExecStart=/usr/bin/caddy run --environ --config /etc/caddy/Caddyfile
ExecReload=/usr/bin/caddy reload --config /etc/caddy/Caddyfile --force
TimeoutStopSec=5s
LimitNOFILE=1048576
PrivateTmp=true
ProtectSystem=full
AmbientCapabilities=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
```

**Create the caddy system user**
Creates a system user (-r) with no shell access (-s /bin/false) for running the Caddy service
```
sudo useradd -r -s /bin/false caddy
```
**Create home directory for caddy user**
Caddy needs a home directory to store SSL certificates and config
```
# Caddy needs a home directory to store SSL certificates and config
sudo mkdir -p /home/caddy
sudo chown caddy:caddy /home/caddy
sudo chmod 750 /home/caddy
```
**Set permissions on config directory**
The caddy user needs read access to the Caddyfile
```
sudo chown -R root:caddy /etc/caddy
sudo chmod 755 /etc/caddy
sudo chmod 644 /etc/caddy/Caddyfile
```
**Set permissions on PMTiles data directory**
The caddy user needs read access to serve the tile files
```
sudo chown -R caddy:caddy /srv/pmtiles
sudo chmod -R 755 /srv/pmtiles
```
**Start Caddy**
```
sudo systemctl daemon-reload
sudo systemctl enable caddy
sudo systemctl start caddy
sudo systemctl status caddy
```
**Make sure Caddy downloads the cert for the domain**
```
sudo journalctl -u caddy -f
```
# 4. Test the tile server
**Test metadata**
```
curl https://tiles.yourtiledomain.com/planet/metadata
```
**Test a tile**
```
curl -I https://tiles.yourtiledomain.com/planet/0/0/0.mvt
```

The pmtiles_proxy expects requests like `/{archive_name}/{z}/{x}/{y}.mvt` directly, not `/tiles/{archive_name}/...`

So for MapLibre, your tile URL will be:
`https://tiles.yourtiledomain.com/planet/{z}/{x}/{y}.mvt`


# Restrict access to the tile server
```
{
    order pmtiles_proxy before file_server
}

tiles.yourtiledomain.com {
    @origin1 header Origin https://youapp.com
    @local   header Origin http://localhost:9200

    header @origin1 Access-Control-Allow-Origin "https://yourapp.com"
    header @local Access-Control-Allow-Origin "http://localhost:9200"

    pmtiles_proxy {
        bucket file:///srv/pmtiles
        cache_size 256
    }
}
```
