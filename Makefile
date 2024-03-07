RESET		:= $(shell tput -Txterm sgr0)
YELLOW		:= $(shell tput -Txterm setaf 3)
BLUE		:= $(shell tput -Txterm setaf 6)

NETWORK_NUM	:= $(shell docker network ls | grep -n ft_network | cut -f 1 -d ':')

COMPOSE_FILE	= ./docker-compose.yaml

all: up

up:
	@echo "$(BLUE)Creating and starting containers..$(RESET)"
	@docker-compose -f $(COMPOSE_FILE) up --build -d
	@echo "$(YELLOW)Containers succesfully created and started$(RESET)"

list:
	@echo "$(BLUE)LIST OF CONTAINERS:$(RESET)"
	@docker ps -a
	@echo ""

	@echo "$(BLUE)LIST OF VOLUMES:$(RESET)"
	@docker volume ls
	@echo ""

	@echo "$(BLUE)LIST OF IMAGES:$(RESET)"
	@docker image ls
	@echo ""

	@echo "$(BLUE)LIST OF NETWORKS:$(RESET)"
ifneq ($(findstring ft_network, $(shell docker network ls)), ft_network)
	@docker network ls
	@echo "$(YELLOW)There is no docker-network named ft_network$(RESET)"
else
	@docker network ls | head -$(shell echo $(NETWORK_NUM)-1 | bc -l)
	@echo "$(YELLOW)$(shell docker network ls | grep ft_network)$(RESET)"
	@docker network ls | tail -$(shell echo $(shell echo $(NETWORK_NUM)\
	-$(shell echo $(NETWORK_NUM)-1 | bc -l) | bc -l))
endif

logs:
	@echo "$(BLUE)OUTPUTS OF CONTAINERS:$(RESET)"
	@docker-compose -f $(COMPOSE_FILE) logs

stop:
ifneq ($(shell docker ps -a | wc -l), 1)
	@echo "$(BLUE)Stopping container..$(RESET)"
	@docker-compose -f $(COMPOSE_FILE) stop -t1
	@echo "$(YELLOW)Containers succesfully stopped$(RESET)"
else
	@echo "$(YELLOW)There is no container to stop$(RESET)"
endif

restart:
ifneq ($(shell docker ps -a | wc -l), 1)
	@echo "$(BLUE)Restarting container..$(RESET)"
	@docker-compose -f $(COMPOSE_FILE) restart
	@echo "$(YELLOW)Containers succesfully restarted$(RESET)"
else
	@echo "$(YELLOW)There is no container to restart$(RESET)"
endif

fclean:
	@echo "$(BLUE)Removing everything..$(RESET)"
	@docker-compose -f $(COMPOSE_FILE) stop -t1
	@echo "$(YELLOW)Containers succesfully stopped$(RESET)"

ifneq ($(shell docker container ls -a | wc -l), 1)
	@docker container prune -f
	@echo "$(YELLOW)Containers successfully removed$(RESET)"
else
	@echo "$(YELLOW)There is no container to remove$(RESET)"
endif

ifneq ($(shell docker network ls | grep ft_network | wc -l), 0)
	@docker network prune -f
	@echo "$(YELLOW)Networks successfully removed$(RESET)"
else
	@echo "$(YELLOW)There is no network to remove$(RESET)"
endif

ifneq ($(shell docker volume ls | wc -l), 1)
	@docker volume prune -f
	@echo "$(YELLOW)Volumes successfully removed$(RESET)"
else
	@echo "$(YELLOW)There is no volume to remove$(RESET)"
endif

ifneq ($(shell docker image ls | wc -l), 1)
	@docker image prune -f
	@echo "$(YELLOW)Images successfully removed$(RESET)"
else
	@echo "$(YELLOW)There is no image to remove$(RESET)"
endif

re: fclean up

.PHONY: all up list logs stop fclean re
