DELIMITER $$

CREATE TRIGGER `establecer_simbolo_especial` 
BEFORE UPDATE ON `EN_IFM_STANDARD`
FOR EACH ROW 
BEGIN
    IF NEW.loading_type = 'Avion' THEN
        SET NEW.simbolo_especial = 'CC221';
    ELSEIF NEW.loading_type = 'Muelle' THEN
        SET NEW.simbolo_especial = 'CC124';
    ELSE
        SET NEW.simbolo_especial = NULL;
    END IF;
END$$

DELIMITER ;
