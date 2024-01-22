RESET		:= $(shell tput -Txterm sgr0)
YELLOW		:= $(shell tput -Txterm setaf 3)
BLUE		:= $(shell tput -Txterm setaf 6)

NETWORK_NUM	:= $(shell sudo docker network ls | grep -n ft_network | cut -f 1 -d ':')

COMPOSE_FILE	= ./docker/docker-compose.yaml

all: up

up:
	@echo "$(BLUE)Creating and starting containers..$(RESET)"

ifneq ($(shell ls ./.data/postgre | grep mysql | wc -l ), 1)
	@sudo mkdir -p ./.data/postgre
	@echo "$(YELLOW).data/postgre directory is created$(RESET)"
else
	@echo "$(YELLOW)./.data/postgre directory already exists$(RESET)"
endif

	@sudo sudo docker-compose -f $(COMPOSE_FILE) up --build -d
	@echo "$(YELLOW)Containers succesfully created and started$(RESET)"

list:
	@echo "$(BLUE)LIST OF CONTAINERS:$(RESET)"
	@sudo docker ps -a
	@echo ""

	@echo "$(BLUE)LIST OF VOLUMES:$(RESET)"
	@sudo docker volume ls
	@echo ""

	@echo "$(BLUE)LIST OF IMAGES:$(RESET)"
	@sudo docker image ls
	@echo ""

	@echo "$(BLUE)LIST OF NETWORKS:$(RESET)"
ifneq ($(findstring ft_network, $(shell sudo docker network ls)), ft_network)
	@sudo docker network ls
	@echo "$(YELLOW)There is no docker-network named ft_network$(RESET)"
else
	@sudo docker network ls | head -$(shell echo $(NETWORK_NUM)-1 | bc -l)
	@echo "$(YELLOW)$(shell docker network ls | grep intra)$(RESET)"
	@sudo docker network ls | tail -$(shell echo $(shell echo $(NETWORK_NUM)\
	-$(shell echo $(NETWORK_NUM)-1 | bc -l) | bc -l))
endif

logs:
	@echo "$(BLUE)OUTPUTS OF CONTAINERS:$(RESET)"
	@sudo docker-compose -f $(COMPOSE_FILE) logs

stop:
ifneq ($(shell sudo docker ps -a | wc -l), 1)
	@echo "$(BLUE)Stopping container..$(RESET)"
	@sudo docker-compose -f $(COMPOSE_FILE) stop -t1
	@echo "$(YELLOW)Containers succesfully stopped$(RESET)"
else
	@echo "$(YELLOW)There is no container to stop$(RESET)"
endif

restart:
ifneq ($(shell sudo docker ps -a | wc -l), 1)
	@echo "$(BLUE)Restarting container..$(RESET)"
	@sudo docker-compose -f $(COMPOSE_FILE) restart
	@echo "$(YELLOW)Containers succesfully restarted$(RESET)"
else
	@echo "$(YELLOW)There is no container to restart$(RESET)"
endif

fclean:
	@echo "$(BLUE)Removing everything..$(RESET)"
	@sudo sudo docker-compose -f $(COMPOSE_FILE) stop -t1
	@echo "$(YELLOW)Containers succesfully stopped$(RESET)"

ifneq ($(shell sudo docker container ls -a | wc -l), 1)
	@sudo sudo docker container prune -f
	@echo "$(YELLOW)Containers successfully removed$(RESET)"
else
	@echo "$(YELLOW)There is no container to remove$(RESET)"
endif

ifneq ($(shell sudo docker network ls | grep ft_network | wc -l), 0)
	@sudo docker network prune -f
	@echo "$(YELLOW)Networks successfully removed$(RESET)"
else
	@echo "$(YELLOW)There is no network to remove$(RESET)"
endif

ifneq ($(shell sudo docker volume ls | wc -l), 1)
	@sudo docker volume prune -f
	@echo "$(YELLOW)Volumes successfully removed$(RESET)"
else
	@echo "$(YELLOW)There is no volume to remove$(RESET)"
endif

# ifneq ($(shell sudo docker image ls | wc -l), 1)
# 	@sudo docker rmi $(shell sudo docker images -q) -f
# 	@echo "$(YELLOW)Images succesfully removed$(RESET)"
# else
# 	@echo "$(YELLOW)There is no image to remove$(RESET)"
# endif

ifeq ($(shell ls ./.data | grep mysql | wc -l ), 1)
	@sudo rm -rf ./.data
	@echo "$(YELLOW)data directory is removed$(RESET)"
endif
	@echo "$(BLUE)Everything is successfully removed!$(RESET)"

re: fclean up

.PHONY: all up list logs stop fclean re
